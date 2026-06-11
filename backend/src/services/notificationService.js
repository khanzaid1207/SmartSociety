/**
 * services/notificationService.js
 * --------------------------------
 * Helper functions to create notifications for users.
 * Called from controllers when something noteworthy happens.
 */

const Notification = require('../models/Notification')
const Society      = require('../models/Society')

// Create a notification for a single user
async function notify(recipientId, type, message, link = '') {
  try {
    await Notification.create({ recipient: recipientId, type, message, link })
  } catch (err) {
    console.error('Failed to create notification:', err.message)
  }
}

// Send an emergency notification to all members of a society
async function notifySociety(societyId, message, link = '') {
  try {
    const society = await Society.findById(societyId).select('members')
    if (!society) return
    const docs = society.members.map((userId) => ({
      recipient: userId,
      type:      'emergency',
      message,
      link,
    }))
    await Notification.insertMany(docs)
  } catch (err) {
    console.error('Failed to notify society:', err.message)
  }
}

module.exports = { notify, notifySociety }
