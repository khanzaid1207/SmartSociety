"""
models/spam_detector.py
------------------------
Binary spam classifier: spam (1) vs. not spam (0).
Uses TF-IDF + Naive Bayes (fast, works well for text classification).
Includes rule-based pre-filter for obvious spam patterns.
"""

import os
import sys
import re
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import cross_val_score

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_processor import preprocess
from data.training_data import SPAM_DATA

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved', 'spam_model.pkl')

# ── Hard rule-based spam patterns (instant block) ─────────────────────────────
HARD_SPAM_PATTERNS = [
    r'\b(earn|make)\s+\d+.*\b(day|month|week|hour)\b',   # earn 50000 per month
    r'\bclick\s+here\b.*\b(prize|win|earn|reward)\b',
    r'\b(otp|cvv|pin|password)\b.*\b(share|send|provide)\b',
    r'\bfree\s+(iphone|laptop|car|gold|cash|recharge)\b',
    r'\b(lucky|selected|chosen|winner)\b.*\b(draw|prize|reward)\b',
    r'\bno\s+(documents?|experience|investment)\s+needed\b',
    r'\b(bit\.ly|tinyurl|t\.co)/\S+',                     # shortened URLs
    r'\bwhatsapp\s+(group|link)\s+join\b',
    r'\b\d+%\s+(guaranteed|assured)\s+(return|profit|income)\b',
    r'\b(sex|xxx|adult|dating)\s+site\b',
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in HARD_SPAM_PATTERNS]


def is_hard_spam(text: str) -> bool:
    """Check if text matches any hard-coded spam pattern."""
    return any(p.search(text) for p in COMPILED_PATTERNS)


class SpamDetector:
    """Binary spam / not-spam classifier."""

    def __init__(self):
        self.pipeline = None
        self.is_trained = False

    def _build_pipeline(self):
        base = MultinomialNB(alpha=0.3)
        return Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=6000,
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=False,    # MultinomialNB needs raw counts / TF
                analyzer='word',
            )),
            ('clf', CalibratedClassifierCV(base, cv=3)),  # calibrate for probabilities
        ])

    def train(self):
        print("🤖 Training spam detector…")
        texts  = [preprocess(text) for text, _ in SPAM_DATA]
        labels = [label for _, label in SPAM_DATA]

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(texts, labels)
        self.is_trained = True

        scores = cross_val_score(self.pipeline, texts, labels, cv=5, scoring='f1')
        print(f"   ✅ Spam detector trained | CV F1: {scores.mean():.2%} ± {scores.std():.2%}")

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.pipeline, MODEL_PATH)
        print(f"   💾 Model saved to {MODEL_PATH}")

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.pipeline = joblib.load(MODEL_PATH)
            self.is_trained = True
            print("   ✅ Spam model loaded from disk")
            return True
        return False

    def predict(self, text: str) -> dict:
        """
        Returns: { is_spam, spam_score, reason }
        """
        if not self.is_trained:
            self.train()

        # Rule-based check first
        if is_hard_spam(text):
            return {
                'is_spam':    True,
                'spam_score': 0.98,
                'reason':     'hard_rule_match',
            }

        # ML check
        cleaned = preprocess(text)
        proba   = self.pipeline.predict_proba([cleaned])[0]

        # Classes might be [0, 1] or [1, 0] depending on training order
        classes = list(self.pipeline.classes_)
        spam_score = float(proba[classes.index(1)]) if 1 in classes else 0.0

        is_spam = spam_score >= 0.65   # threshold

        return {
            'is_spam':    is_spam,
            'spam_score': round(spam_score, 4),
            'reason':     'ml_model' if is_spam else 'clean',
        }


_detector = None

def get_spam_detector() -> SpamDetector:
    global _detector
    if _detector is None:
        _detector = SpamDetector()
        if not _detector.load():
            _detector.train()
    return _detector
