# SmartSociety AI Microservice

Python FastAPI service providing all AI/ML features for SmartSociety.

## Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Category Classifier | TF-IDF + Logistic Regression | Tag posts: emergency/help/event/business/lost_found/general |
| Spam Detector | TF-IDF + Naive Bayes + Rules | Block fake/promotional spam posts |
| Emergency Detector | TF-IDF + SVM + Keyword scoring | Pin urgent posts, notify society |
| Sentiment Analyzer | TF-IDF + Logistic Regression | Track community mood |
| Feed Recommender | Content-based filtering | Personalised post ranking |

## Setup

```bash
# 1. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env file
cp .env.example .env

# 4. Run the service
python main.py
```

Service starts at: http://localhost:5001

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /analyse | **Main endpoint** — runs all models at once |
| POST | /classify | Category prediction only |
| POST | /spam-check | Spam detection only |
| POST | /emergency-check | Emergency detection only |
| POST | /sentiment | Sentiment analysis only |
| POST | /feed | Personalised feed ranking |
| POST | /trending | Trending categories |
| POST | /train | Admin: retrain all models |
| GET | /health | Health check |

## Example Request

```bash
curl -X POST http://localhost:5001/analyse \
  -H "Content-Type: application/json" \
  -d '{"text": "Water pipe burst on 3rd floor! Need help immediately!"}'
```

Response:
```json
{
  "success": true,
  "category": "emergency",
  "category_confidence": 0.94,
  "is_spam": false,
  "is_emergency": true,
  "urgency_level": "critical",
  "sentiment": "negative",
  "sentiment_confidence": 0.87
}
```

## How Node.js uses this

The Node backend calls `/analyse` every time a user creates a post:
1. If `is_spam = true` → reject post with 422
2. Assign `category` from AI response
3. If `is_emergency = true` → pin post + notify all society members
4. Store `sentiment` for community mood tracking
