"""
models/sentiment_analyzer.py
------------------------------
Classifies post sentiment: positive | negative | neutral
Used for community mood tracking and moderation alerts.
"""

import os
import sys
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_processor import preprocess
from data.training_data import SENTIMENT_DATA

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved', 'sentiment_model.pkl')

# Lexicon-based scoring as fallback
POSITIVE_WORDS = [
    'amazing', 'great', 'wonderful', 'excellent', 'fantastic', 'beautiful',
    'happy', 'joy', 'love', 'thank', 'appreciate', 'kudos', 'brilliant',
    'good', 'nice', 'best', 'awesome', 'superb', 'improved', 'helpful',
    'safe', 'clean', 'comfortable', 'satisfied', 'glad', 'pleased',
]

NEGATIVE_WORDS = [
    'terrible', 'horrible', 'pathetic', 'disgusting', 'awful', 'worst',
    'frustrated', 'angry', 'useless', 'ridiculous', 'disappointed',
    'broken', 'dirty', 'noisy', 'problem', 'issue', 'complaint',
    'never', 'always', 'poor', 'bad', 'wrong', 'fail', 'unhappy',
    'sick', 'annoying', 'unbearable', 'irresponsible', 'negligent',
]


def lexicon_sentiment(text: str) -> float:
    """Returns score: positive > 0, negative < 0."""
    text_lower = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in text_lower)
    if pos + neg == 0:
        return 0.0
    return (pos - neg) / (pos + neg)


class SentimentAnalyzer:

    LABELS = ['positive', 'neutral', 'negative']

    def __init__(self):
        self.pipeline = None
        self.is_trained = False

    def _build_pipeline(self):
        return Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=4000,
                ngram_range=(1, 2),
                sublinear_tf=True,
            )),
            ('clf', LogisticRegression(
                max_iter=500,
                C=2.0,
                class_weight='balanced',
                solver='lbfgs',
                multi_class='multinomial',
            )),
        ])

    def train(self):
        print("🤖 Training sentiment analyzer…")
        texts  = [preprocess(text) for text, _ in SENTIMENT_DATA]
        labels = [label for _, label in SENTIMENT_DATA]

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(texts, labels)
        self.is_trained = True

        scores = cross_val_score(self.pipeline, texts, labels, cv=3, scoring='accuracy')
        print(f"   ✅ Sentiment analyzer trained | CV Accuracy: {scores.mean():.2%}")

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.pipeline, MODEL_PATH)

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.pipeline = joblib.load(MODEL_PATH)
            self.is_trained = True
            print("   ✅ Sentiment model loaded from disk")
            return True
        return False

    def predict(self, text: str) -> dict:
        if not self.is_trained:
            self.train()

        cleaned = preprocess(text)
        proba   = self.pipeline.predict_proba([cleaned])[0]
        classes = list(self.pipeline.classes_)

        top_idx   = int(np.argmax(proba))
        sentiment = classes[top_idx]
        confidence = float(proba[top_idx])

        # Lexicon as secondary signal for low-confidence predictions
        lex_score = lexicon_sentiment(text)
        if confidence < 0.50:
            if lex_score > 0.3:
                sentiment, confidence = 'positive', 0.60
            elif lex_score < -0.3:
                sentiment, confidence = 'negative', 0.60

        all_scores = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}

        return {
            'sentiment':     sentiment,
            'confidence':    round(confidence, 4),
            'all_scores':    all_scores,
            'lexicon_score': round(lex_score, 4),
        }


_analyzer = None

def get_sentiment_analyzer() -> SentimentAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = SentimentAnalyzer()
        if not _analyzer.load():
            _analyzer.train()
    return _analyzer
