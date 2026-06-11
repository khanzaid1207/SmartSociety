"""
main.py
--------
SmartSociety AI Microservice — FastAPI entry point.

Endpoints:
  POST /classify        → Category prediction
  POST /spam-check      → Spam detection
  POST /emergency-check → Emergency detection
  POST /sentiment       → Sentiment analysis
  POST /analyse         → All models combined (use this in production)
  POST /feed            → Personalized feed ranking
  POST /trending        → Trending categories
  POST /train           → Retrain all models (admin)
  GET  /health          → Health check

Run:
  python main.py
  OR
  uvicorn main:app --host 0.0.0.0 --port 5001 --reload
"""

import os
import sys
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("smartsociety.ai")


# ── Startup: load/train all models ───────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 SmartSociety AI Service starting…")
    start = time.time()

    AUTO_TRAIN = os.getenv("AUTO_TRAIN", "true").lower() == "true"

    if AUTO_TRAIN:
        logger.info("📦 Loading / training AI models…")
        from models.category_classifier import get_classifier
        from models.spam_detector       import get_spam_detector
        from models.emergency_detector  import get_emergency_detector
        from models.sentiment_analyzer  import get_sentiment_analyzer
        from models.recommender         import get_recommender

        get_classifier()
        get_spam_detector()
        get_emergency_detector()
        get_sentiment_analyzer()
        get_recommender()

    elapsed = time.time() - start
    logger.info(f"✅ All models ready in {elapsed:.1f}s")
    logger.info(f"🌐 Serving on http://{os.getenv('HOST','0.0.0.0')}:{os.getenv('PORT','5001')}")

    yield  # Server is running

    logger.info("👋 AI Service shutting down")


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SmartSociety AI Service",
    description="AI/ML microservice for post categorisation, spam detection, emergency alerts, sentiment analysis and personalised feed ranking.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow requests from the Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:5173",
        os.getenv("BACKEND_URL", "http://localhost:5000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_timing(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    response.headers["X-Process-Time-Ms"] = f"{ms:.1f}"
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms:.0f}ms)")
    return response


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal AI service error", "detail": str(exc)},
    )


# ── Include routes ────────────────────────────────────────────────────────────
from routes.ai_routes import router
app.include_router(router)


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "SmartSociety AI",
        "version": "1.0.0",
        "status":  "running",
        "endpoints": {
            "analyse":        "POST /analyse  — Full pipeline (all models)",
            "classify":       "POST /classify — Category prediction",
            "spam_check":     "POST /spam-check",
            "emergency":      "POST /emergency-check",
            "sentiment":      "POST /sentiment",
            "feed":           "POST /feed — Personalised ranking",
            "trending":       "POST /trending",
            "train":          "POST /train — Admin retrain",
            "health":         "GET  /health",
        },
    }


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5001)),
        reload=os.getenv("NODE_ENV", "development") == "development",
        log_level="info",
    )
