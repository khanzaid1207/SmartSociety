"""
routes/ai_routes.py
--------------------
FastAPI router exposing all AI endpoints consumed by the Node.js backend.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from models.category_classifier import get_classifier
from models.spam_detector       import get_spam_detector
from models.emergency_detector  import get_emergency_detector
from models.sentiment_analyzer  import get_sentiment_analyzer
from models.recommender         import get_recommender

router = APIRouter()


# ── Request / Response Models ─────────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Post content to analyse")

class AnalyseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)

class PostItem(BaseModel):
    _id:          str
    category:     str           = 'general'
    createdAt:    str
    isEmergency:  bool          = False
    likesCount:   int           = 0

class InteractionItem(BaseModel):
    category: str
    action:   str               # 'like' | 'comment' | 'view' | 'share'

class FeedRequest(BaseModel):
    posts:        List[Dict[str, Any]]
    interactions: Optional[List[Dict[str, Any]]] = []
    limit:        int = 20

class TrainRequest(BaseModel):
    secret: str = Field(..., description="Admin secret to trigger retraining")


# ── 1. POST /classify — Category prediction ───────────────────────────────────
@router.post("/classify")
async def classify_post(req: TextRequest):
    """
    Classify a post into one of:
    emergency | help | event | business | lost_found | general

    Called by Node.js when a user creates a new post.
    """
    try:
        result = get_classifier().predict(req.text)
        return {
            "success":  True,
            "category": result["category"],
            "confidence": result["confidence"],
            "all_scores": result["all_scores"],
            "keyword_overridden": result["keyword_overridden"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 2. POST /spam-check — Spam detection ─────────────────────────────────────
@router.post("/spam-check")
async def check_spam(req: TextRequest):
    """
    Detect if a post is spam.
    Returns { is_spam, spam_score, reason }

    Called by Node.js before saving a post.
    If is_spam=true → Node.js rejects the post with a 422.
    """
    try:
        result = get_spam_detector().predict(req.text)
        return {
            "success":    True,
            "is_spam":    result["is_spam"],
            "spam_score": result["spam_score"],
            "reason":     result["reason"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 3. POST /emergency-check — Emergency detection ───────────────────────────
@router.post("/emergency-check")
async def check_emergency(req: TextRequest):
    """
    Detect if a post is an emergency situation.
    Returns { is_emergency, emergency_score, urgency_level }

    Called by Node.js when a post passes spam check.
    If is_emergency=true → post is pinned to top + society notified.
    """
    try:
        result = get_emergency_detector().predict(req.text)
        return {
            "success":        True,
            "is_emergency":   result["is_emergency"],
            "emergency_score":result["emergency_score"],
            "keyword_score":  result["keyword_score"],
            "ml_score":       result["ml_score"],
            "urgency_level":  result["urgency_level"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 4. POST /sentiment — Sentiment analysis ───────────────────────────────────
@router.post("/sentiment")
async def analyse_sentiment(req: TextRequest):
    """
    Analyse sentiment of post text.
    Returns { sentiment, confidence, all_scores }

    Used for: community mood dashboard, moderation alerts on negative content.
    """
    try:
        result = get_sentiment_analyzer().predict(req.text)
        return {
            "success":     True,
            "sentiment":   result["sentiment"],
            "confidence":  result["confidence"],
            "all_scores":  result["all_scores"],
            "lexicon_score": result["lexicon_score"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 5. POST /analyse — Full pipeline (all 4 models at once) ──────────────────
@router.post("/analyse")
async def analyse_post(req: AnalyseRequest):
    """
    Run all AI models on a post in one call.
    Returns combined result from:
      - category classifier
      - spam detector
      - emergency detector
      - sentiment analyzer

    Node.js calls this single endpoint instead of 3 separate ones.
    """
    try:
        text = req.text

        category  = get_classifier().predict(text)
        spam      = get_spam_detector().predict(text)
        emergency = get_emergency_detector().predict(text)
        sentiment = get_sentiment_analyzer().predict(text)

        return {
            "success": True,
            "text":    text,

            # Category
            "category":           category["category"],
            "category_confidence":category["confidence"],
            "category_all":       category["all_scores"],

            # Spam
            "is_spam":    spam["is_spam"],
            "spam_score": spam["spam_score"],
            "spam_reason":spam["reason"],

            # Emergency
            "is_emergency":    emergency["is_emergency"],
            "emergency_score": emergency["emergency_score"],
            "urgency_level":   emergency["urgency_level"],

            # Sentiment
            "sentiment":            sentiment["sentiment"],
            "sentiment_confidence": sentiment["confidence"],
            "sentiment_scores":     sentiment["all_scores"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 6. POST /feed — Personalized feed ranking ────────────────────────────────
@router.post("/feed")
async def rank_feed(req: FeedRequest):
    """
    Re-rank a list of posts for personalized feed.
    Called by Node.js with the user's recent interactions.

    interactions: [{ category: 'event', action: 'like' }, ...]
    """
    try:
        result = get_recommender().get_recommendations(
            posts=req.posts,
            interactions=req.interactions,
            limit=req.limit,
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 7. POST /trending — Trending categories ───────────────────────────────────
@router.post("/trending")
async def get_trending(req: FeedRequest):
    """
    Find trending categories from a list of posts.
    """
    try:
        result = get_recommender().trending_categories(req.posts)
        return {"success": True, "trending": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 8. POST /train — Retrain all models ──────────────────────────────────────
@router.post("/train")
async def retrain_models(req: TrainRequest):
    """
    Admin endpoint to retrain all models with latest training data.
    Requires the ADMIN_SECRET env variable.
    """
    import os
    expected = os.getenv("ADMIN_SECRET", "smartsociety-admin-2024")
    if req.secret != expected:
        raise HTTPException(status_code=403, detail="Invalid admin secret")

    try:
        get_classifier().train()
        get_spam_detector().train()
        get_emergency_detector().train()
        get_sentiment_analyzer().train()
        return {"success": True, "message": "All models retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 9. GET /health — Health check ────────────────────────────────────────────
@router.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status":  "ok",
        "service": "SmartSociety AI",
        "models":  ["category_classifier", "spam_detector", "emergency_detector", "sentiment_analyzer", "recommender"],
    }
