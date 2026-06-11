"""
models/emergency_detector.py
------------------------------
Detects whether a post describes an emergency situation.
Uses a hybrid approach:
  1. Keyword scoring (fast, high recall)
  2. ML binary classifier (high precision)
  3. Combined final score
"""

import os
import sys
import re
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import cross_val_score

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_processor import preprocess
from data.training_data import CATEGORY_DATA

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved', 'emergency_model.pkl')

# ── Weighted keyword scoring ───────────────────────────────────────────────────
HIGH_URGENCY = {
    'fire': 0.9, 'blast': 0.95, 'explosion': 0.95, 'flood': 0.85,
    'collapse': 0.9, 'evacuate': 0.95, 'gas leak': 0.9, 'ambulance': 0.85,
    'electrocution': 0.9, 'short circuit': 0.85, 'sos': 0.95,
    'unconscious': 0.9, 'cardiac': 0.9, 'earthquake': 0.85,
    'intruder': 0.8, 'attack': 0.8, 'stabbed': 0.95, 'shot': 0.9,
}

MEDIUM_URGENCY = {
    'urgent': 0.5, 'emergency': 0.6, 'danger': 0.6, 'immediate': 0.5,
    'stuck': 0.4, 'broken': 0.3, 'burst': 0.65, 'leaking': 0.4,
    'help needed': 0.5, 'immediately': 0.5, 'critical': 0.6,
    'accident': 0.6, 'injured': 0.65, 'bleeding': 0.7, 'pain': 0.3,
}

NEGATION_WORDS = ['not ', "isn't", "wasn't", 'no longer', 'fixed', 'resolved', 'repaired']


def keyword_emergency_score(text: str) -> float:
    """
    Score text for emergency-level urgency using keyword matching.
    Returns 0.0 to 1.0.
    """
    text_lower = text.lower()

    # Negation check — "fire is out" is not an emergency
    if any(neg in text_lower for neg in NEGATION_WORDS):
        return 0.0

    score = 0.0
    for kw, weight in HIGH_URGENCY.items():
        if kw in text_lower:
            score = max(score, weight)

    for kw, weight in MEDIUM_URGENCY.items():
        if kw in text_lower:
            score = max(score, weight * 0.8)

    # Boost if exclamation marks (urgency indicator)
    if text.count('!') >= 2:
        score = min(score + 0.1, 1.0)

    # Boost if all-caps words present
    if re.search(r'\b[A-Z]{3,}\b', text):
        score = min(score + 0.08, 1.0)

    return round(score, 4)


def build_emergency_dataset():
    """Convert category data into binary emergency labels."""
    texts  = []
    labels = []
    for text, cat in CATEGORY_DATA:
        texts.append(preprocess(text))
        labels.append(1 if cat == 'emergency' else 0)
    return texts, labels


class EmergencyDetector:
    """Binary emergency / not-emergency classifier."""

    def __init__(self):
        self.pipeline = None
        self.is_trained = False

    def _build_pipeline(self):
        base = LinearSVC(C=1.5, max_iter=2000, class_weight='balanced')
        return Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 3),
                sublinear_tf=True,
            )),
            ('clf', CalibratedClassifierCV(base, cv=3)),
        ])

    def train(self):
        print("🤖 Training emergency detector…")
        texts, labels = build_emergency_dataset()

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(texts, labels)
        self.is_trained = True

        scores = cross_val_score(self.pipeline, texts, labels, cv=5, scoring='f1')
        print(f"   ✅ Emergency detector trained | CV F1: {scores.mean():.2%} ± {scores.std():.2%}")

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.pipeline, MODEL_PATH)
        print(f"   💾 Model saved to {MODEL_PATH}")

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.pipeline = joblib.load(MODEL_PATH)
            self.is_trained = True
            print("   ✅ Emergency model loaded from disk")
            return True
        return False

    def predict(self, text: str) -> dict:
        """
        Returns: { is_emergency, emergency_score, keyword_score, ml_score, urgency_level }
        """
        if not self.is_trained:
            self.train()

        # Keyword score
        kw_score = keyword_emergency_score(text)

        # ML score
        cleaned  = preprocess(text)
        proba    = self.pipeline.predict_proba([cleaned])[0]
        classes  = list(self.pipeline.classes_)
        ml_score = float(proba[classes.index(1)]) if 1 in classes else 0.0

        # Combined score — weight keyword higher (safety first)
        combined = (kw_score * 0.55) + (ml_score * 0.45)

        # Keyword score alone can trigger emergency if very high
        is_emergency = combined >= 0.45 or kw_score >= 0.8

        # Urgency level
        if combined >= 0.80:
            urgency = 'critical'
        elif combined >= 0.55:
            urgency = 'high'
        elif combined >= 0.35:
            urgency = 'medium'
        else:
            urgency = 'low'

        return {
            'is_emergency':   is_emergency,
            'emergency_score': round(combined, 4),
            'keyword_score':  round(kw_score, 4),
            'ml_score':       round(ml_score, 4),
            'urgency_level':  urgency,
        }


_detector = None

def get_emergency_detector() -> EmergencyDetector:
    global _detector
    if _detector is None:
        _detector = EmergencyDetector()
        if not _detector.load():
            _detector.train()
    return _detector
