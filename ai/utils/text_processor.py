"""
utils/text_processor.py
------------------------
Cleans and preprocesses text before feeding it to ML models.
Handles: lowercasing, punctuation removal, stopword removal, stemming.
"""

import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# Download NLTK data on first run
def download_nltk_data():
    packages = ['stopwords', 'punkt', 'wordnet', 'averaged_perceptron_tagger']
    for pkg in packages:
        try:
            nltk.download(pkg, quiet=True)
        except Exception:
            pass

download_nltk_data()

stemmer = PorterStemmer()

try:
    STOP_WORDS = set(stopwords.words('english'))
except Exception:
    STOP_WORDS = set()

# Words we keep even if they are "stop words" — they carry meaning in our domain
DOMAIN_KEEP = {
    'not', 'no', 'urgent', 'help', 'fire', 'danger', 'emergency',
    'lost', 'found', 'missing', 'broken', 'leak', 'stuck', 'flood',
    'free', 'new', 'now', 'please', 'need', 'want', 'sale',
}
STOP_WORDS -= DOMAIN_KEEP


def clean_text(text: str) -> str:
    """
    Full cleaning pipeline:
    1. Lowercase
    2. Remove URLs
    3. Remove emojis / non-ASCII (keep ₹ sign)
    4. Remove punctuation
    5. Remove extra whitespace
    """
    if not text:
        return ""

    text = text.lower().strip()

    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)

    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)

    # Remove phone numbers
    text = re.sub(r'\b\d{10,}\b', '', text)

    # Remove emojis and special unicode but keep ₹
    text = re.sub(r'[^\x00-\x7F₹]', ' ', text)

    # Remove punctuation except apostrophe
    text = text.translate(str.maketrans('', '', string.punctuation.replace("'", '')))

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def tokenize(text: str) -> list:
    """Split cleaned text into word tokens."""
    return text.split()


def remove_stopwords(tokens: list) -> list:
    """Remove stop words from token list."""
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]


def stem_tokens(tokens: list) -> list:
    """Apply Porter stemming to reduce words to root form."""
    return [stemmer.stem(t) for t in tokens]


def preprocess(text: str, stem: bool = False) -> str:
    """
    Full preprocessing pipeline.
    Returns a single cleaned string ready for TF-IDF vectorization.
    """
    cleaned = clean_text(text)
    tokens  = tokenize(cleaned)
    tokens  = remove_stopwords(tokens)
    if stem:
        tokens = stem_tokens(tokens)
    return ' '.join(tokens)


def extract_features(text: str) -> dict:
    """
    Extract hand-crafted features to assist ML models.
    These are used alongside TF-IDF vectors.
    """
    text_lower = text.lower()
    return {
        'has_exclamation':     int('!' in text),
        'exclamation_count':   text.count('!'),
        'has_question':        int('?' in text),
        'word_count':          len(text.split()),
        'char_count':          len(text),
        'uppercase_ratio':     sum(1 for c in text if c.isupper()) / max(len(text), 1),
        'has_phone':           int(bool(re.search(r'\d{10}', text))),
        'has_url':             int(bool(re.search(r'http|www', text_lower))),
        'has_price':           int(bool(re.search(r'₹|\brs\b|\brupee', text_lower))),
        'has_emergency_word':  int(bool(re.search(
            r'\b(urgent|emergency|fire|help|danger|alert|sos|accident|burst|leak|flood|evacuate|collapse)\b',
            text_lower))),
        'has_event_word':      int(bool(re.search(
            r'\b(celebration|party|event|meeting|camp|session|class|drive|competition|ceremony)\b',
            text_lower))),
        'has_sale_word':       int(bool(re.search(
            r'\b(sale|selling|available|buy|purchase|delivery|order|service|offer|discount)\b',
            text_lower))),
        'has_lost_word':       int(bool(re.search(
            r'\b(lost|found|missing|search|looking for|disappeared|gone)\b',
            text_lower))),
        'has_spam_word':       int(bool(re.search(
            r'\b(earn|click|free|win|prize|lucky|selected|guaranteed|instant|unlimited|crore|lakh)\b',
            text_lower))),
        'is_very_short':       int(len(text.split()) < 5),
        'is_long':             int(len(text.split()) > 40),
    }
