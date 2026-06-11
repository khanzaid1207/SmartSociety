/**
 * services/aiService.js
 * ----------------------
 * Calls the Python AI microservice.
 * Uses the combined /analyse endpoint for efficiency.
 * Falls back gracefully if AI service is offline.
 */

const axios = require('axios')

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001'
const TIMEOUT = 8000

const ai = axios.create({ baseURL: AI_URL, timeout: TIMEOUT })

const DEFAULT = { category:'general', isSpam:false, isEmergency:false, score:0, sentiment:'neutral', urgencyLevel:'low' }

/**
 * Full analysis — category + spam + emergency + sentiment in one call.
 */
async function analysePost(content) {
  try {
    const res = await ai.post('/analyse', { text: content })
    const d   = res.data

    if (d.is_spam) return { ...DEFAULT, isSpam: true }

    return {
      category:     d.category     ?? 'general',
      isSpam:       d.is_spam      ?? false,
      isEmergency:  d.is_emergency ?? false,
      score:        d.category_confidence ?? 0,
      sentiment:    d.sentiment    ?? 'neutral',
      urgencyLevel: d.urgency_level ?? 'low',
    }
  } catch (err) {
    console.warn('⚠️  AI service unavailable:', err.message)
    return DEFAULT
  }
}

/**
 * Personalised feed ranking.
 * posts: array of post objects
 * interactions: user's past engagement [{ category, action }]
 */
async function rankFeed(posts, interactions = []) {
  try {
    const res = await ai.post('/feed', { posts, interactions, limit: posts.length })
    return res.data.ranked_posts ?? posts
  } catch {
    return posts
  }
}

/**
 * Get trending categories from a list of posts.
 */
async function getTrending(posts) {
  try {
    const res = await ai.post('/trending', { posts })
    return res.data.trending ?? []
  } catch {
    return []
  }
}

/**
 * Sentiment analysis for a single text.
 */
async function analyseSentiment(text) {
  try {
    const res = await ai.post('/sentiment', { text })
    return res.data
  } catch {
    return { sentiment: 'neutral', confidence: 0 }
  }
}

module.exports = { analysePost, rankFeed, getTrending, analyseSentiment }
