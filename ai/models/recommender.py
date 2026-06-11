"""
models/recommender.py
----------------------
Personalized feed recommendation engine.
Strategy: Content-based filtering using category preferences + engagement history.

How it works:
  1. Track which categories the user engages with most (likes/comments)
  2. Assign a preference score to each category
  3. Rank feed posts by: preference_score * recency_score * emergency_boost
  4. Return re-ranked post IDs
"""

import os
import sys
import math
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ── Recency scoring ───────────────────────────────────────────────────────────
def recency_score(created_at_iso: str, half_life_hours: float = 12.0) -> float:
    """
    Exponential decay based on post age.
    Post at half_life_hours old → score = 0.5
    """
    try:
        created = datetime.fromisoformat(created_at_iso.replace('Z', '+00:00'))
        now     = datetime.now(timezone.utc)
        age_h   = (now - created).total_seconds() / 3600.0
        return math.exp(-0.693 * age_h / half_life_hours)
    except Exception:
        return 0.5


# ── Category preference weights (default for new users) ───────────────────────
DEFAULT_WEIGHTS = {
    'emergency': 1.0,   # always shown first
    'help':      0.7,
    'event':     0.6,
    'business':  0.4,
    'lost_found':0.5,
    'general':   0.3,
}


class FeedRecommender:
    """
    Simple content-based feed recommendation.
    No persistent storage needed — uses interaction data passed per request.
    """

    def __init__(self):
        self.default_weights = DEFAULT_WEIGHTS.copy()

    def _compute_user_weights(self, interactions: List[Dict]) -> Dict[str, float]:
        """
        Compute category preference weights from user interactions.
        interactions: [{ category, action, weight }]
          action: 'like' | 'comment' | 'view'
          weight: 1.0 for like, 1.5 for comment, 0.3 for view
        """
        action_weights = {'like': 1.0, 'comment': 1.5, 'view': 0.3, 'share': 1.2}
        category_scores = defaultdict(float)
        category_counts = defaultdict(int)

        for interaction in interactions:
            cat    = interaction.get('category', 'general')
            action = interaction.get('action', 'view')
            w      = action_weights.get(action, 0.3)
            category_scores[cat] += w
            category_counts[cat] += 1

        if not category_scores:
            return self.default_weights.copy()

        # Normalize to 0-1 range
        max_score = max(category_scores.values(), default=1)
        user_weights = {}
        for cat in DEFAULT_WEIGHTS:
            if cat in category_scores:
                # Blend user preference with default (50/50 for cold start)
                norm = category_scores[cat] / max_score
                user_weights[cat] = 0.5 * norm + 0.5 * DEFAULT_WEIGHTS[cat]
            else:
                user_weights[cat] = DEFAULT_WEIGHTS[cat] * 0.7  # slight discount

        # Emergency always stays at max
        user_weights['emergency'] = 1.0
        return user_weights

    def rank_posts(self, posts: List[Dict], interactions: List[Dict] = None) -> List[Dict]:
        """
        Re-rank a list of posts for personalized feed.

        posts: list of post dicts with at least:
          { _id, category, createdAt, isEmergency, likesCount }

        interactions: user's past engagement history

        Returns: posts sorted by relevance score (descending)
        """
        user_weights = self._compute_user_weights(interactions or [])

        scored = []
        for post in posts:
            cat        = post.get('category', 'general')
            is_emerg   = post.get('isEmergency', False)
            created_at = post.get('createdAt', datetime.now(timezone.utc).isoformat())
            likes      = post.get('likesCount', 0)

            # Base scores
            pref_score    = user_weights.get(cat, 0.3)
            rec_score     = recency_score(created_at)
            popularity    = math.log1p(likes) / 10.0   # log scale

            # Emergency boost — always pin to top
            emerg_boost = 5.0 if is_emerg else 1.0

            final_score = (pref_score * 0.45 + rec_score * 0.40 + popularity * 0.15) * emerg_boost

            scored.append({
                **post,
                '_score':      round(final_score, 6),
                '_pref':       round(pref_score, 4),
                '_recency':    round(rec_score, 4),
                '_popularity': round(popularity, 4),
            })

        scored.sort(key=lambda x: x['_score'], reverse=True)
        return scored

    def get_recommendations(
        self,
        posts: List[Dict],
        interactions: List[Dict] = None,
        limit: int = 20
    ) -> Dict:
        """
        Main recommendation endpoint.
        Returns ranked post IDs and their scores.
        """
        ranked = self.rank_posts(posts, interactions)[:limit]
        return {
            'ranked_posts': ranked,
            'post_ids':     [p['_id'] for p in ranked],
            'total':        len(ranked),
            'personalized': bool(interactions),
        }

    def trending_categories(self, posts: List[Dict]) -> List[Dict]:
        """
        Find which categories are trending in the current feed.
        """
        category_stats = defaultdict(lambda: {'count': 0, 'likes': 0, 'score': 0.0})

        for post in posts:
            cat = post.get('category', 'general')
            rec = recency_score(post.get('createdAt', datetime.now(timezone.utc).isoformat()), half_life_hours=6)
            category_stats[cat]['count']  += 1
            category_stats[cat]['likes']  += post.get('likesCount', 0)
            category_stats[cat]['score']  += rec

        result = []
        for cat, stats in category_stats.items():
            trend_score = stats['count'] * 0.4 + math.log1p(stats['likes']) * 0.3 + stats['score'] * 0.3
            result.append({
                'category':    cat,
                'post_count':  stats['count'],
                'total_likes': stats['likes'],
                'trend_score': round(trend_score, 4),
            })

        result.sort(key=lambda x: x['trend_score'], reverse=True)
        return result


_recommender = None

def get_recommender() -> FeedRecommender:
    global _recommender
    if _recommender is None:
        _recommender = FeedRecommender()
    return _recommender
