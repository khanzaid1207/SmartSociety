"""
models/category_classifier.py
-------------------------------
Post category classifier using TF-IDF + Logistic Regression pipeline.
Categories: emergency | help | event | business | lost_found | general

Also supports a keyword-boost layer on top of ML predictions
to ensure critical categories (emergency) are never missed.
"""

import os
import sys
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_processor import preprocess, extract_features
from data.training_data import CATEGORY_DATA

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved', 'category_model.pkl')

# ── Keyword rules (overrides ML when confidence is low) ───────────────────────
EMERGENCY_KEYWORDS = [
    'fire', 'burst', 'flood', 'evacuate', 'collapse', 'sos', 'gas leak',
    'short circuit', 'blast', 'electrocution', 'unconscious', 'ambulance',
    'fallen', 'critical', 'danger', 'threat', 'intruder', 'immediately evacuate',
    'earthquake', 'emergency', 'urgent danger',
]
HELP_KEYWORDS = [
    'can anyone help', 'need help', 'looking for plumber', 'looking for electrician',
    'does anyone have', 'can i borrow', 'recommend', 'anyone know', 'need a',
]
EVENT_KEYWORDS = [
    'party', 'celebration', 'meeting', 'camp', 'workshop', 'session',
    'event on', 'event this', 'join us', 'you are invited',
]
BUSINESS_KEYWORDS = [
    'for sale', 'available at', 'delivery', 'order now', 'book now', 'contact for rates',
    'services offered', 'we provide', 'launching', 'new shop', 'tiffin service',
]
LOST_FOUND_KEYWORDS = [
    'lost my', 'found a', 'found an', 'is missing', 'went missing', 'please return',
    'collect from', 'if found', 'have you seen', 'missing since',
]

KEYWORD_RULES = {
    'emergency': EMERGENCY_KEYWORDS,
    'help':      HELP_KEYWORDS,
    'event':     EVENT_KEYWORDS,
    'business':  BUSINESS_KEYWORDS,
    'lost_found':LOST_FOUND_KEYWORDS,
}


def keyword_override(text: str, ml_category: str, ml_confidence: float) -> tuple:
    """
    Apply keyword rules when ML confidence is below threshold.
    Emergency always overrides regardless of confidence.
    Returns (final_category, final_confidence)
    """
    text_lower = text.lower()

    # Emergency is safety-critical — always check keywords regardless
    if any(kw in text_lower for kw in EMERGENCY_KEYWORDS):
        return 'emergency', max(ml_confidence, 0.85)

    # For other categories, only override if ML confidence is low
    if ml_confidence < 0.55:
        for category, keywords in KEYWORD_RULES.items():
            if any(kw in text_lower for kw in keywords):
                return category, 0.70

    return ml_category, ml_confidence


class CategoryClassifier:
    """TF-IDF + Logistic Regression post category classifier."""

    LABELS = ['emergency', 'help', 'event', 'business', 'lost_found', 'general']

    def __init__(self):
        self.pipeline = None
        self.is_trained = False

    def _build_pipeline(self):
        return Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=8000,
                ngram_range=(1, 3),      # unigrams, bigrams, trigrams
                min_df=1,
                max_df=0.95,
                sublinear_tf=True,       # log(tf) smoothing
                analyzer='word',
            )),
            ('clf', LogisticRegression(
                max_iter=1000,
                C=3.0,
                class_weight='balanced', # handle class imbalance
                solver='lbfgs',
                multi_class='multinomial',
            )),
        ])

    def train(self):
        """Train the model on CATEGORY_DATA."""
        print("🤖 Training category classifier…")
        texts  = [preprocess(text) for text, _ in CATEGORY_DATA]
        labels = [label for _, label in CATEGORY_DATA]

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(texts, labels)
        self.is_trained = True

        # Cross-validation score
        scores = cross_val_score(self.pipeline, texts, labels, cv=5, scoring='accuracy')
        print(f"   ✅ Category classifier trained | CV Accuracy: {scores.mean():.2%} ± {scores.std():.2%}")

        # Save model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.pipeline, MODEL_PATH)
        print(f"   💾 Model saved to {MODEL_PATH}")

    def load(self):
        """Load pre-trained model from disk."""
        if os.path.exists(MODEL_PATH):
            self.pipeline = joblib.load(MODEL_PATH)
            self.is_trained = True
            print("   ✅ Category model loaded from disk")
            return True
        return False

    def predict(self, text: str) -> dict:
        """
        Predict category for a post.
        Returns: { category, confidence, all_scores }
        """
        if not self.is_trained:
            self.train()

        cleaned = preprocess(text)
        proba   = self.pipeline.predict_proba([cleaned])[0]
        classes = self.pipeline.classes_

        # Get top prediction
        top_idx    = int(np.argmax(proba))
        ml_cat     = classes[top_idx]
        ml_conf    = float(proba[top_idx])

        # Apply keyword override
        final_cat, final_conf = keyword_override(text, ml_cat, ml_conf)

        # Build all scores dict
        all_scores = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}

        return {
            'category':   final_cat,
            'confidence': round(final_conf, 4),
            'all_scores': all_scores,
            'ml_category': ml_cat,
            'keyword_overridden': final_cat != ml_cat,
        }


# Singleton
_classifier = None

def get_classifier() -> CategoryClassifier:
    global _classifier
    if _classifier is None:
        _classifier = CategoryClassifier()
        if not _classifier.load():
            _classifier.train()
    return _classifier
