const { Router } = require('express');
const requireAuth = require('../../middleware/requireAuth');
const { getNotifications, getUnreadCount, markAllRead } = require('./notifications.service');

const router = Router();

// GET /notifications — fetch current user's 30 most recent notifications + unread count
router.get('/', requireAuth, async (req, res) => {
  try {
    const [notifications, unread] = await Promise.all([
      getNotifications(req.user.userId),
      getUnreadCount(req.user.userId),
    ]);
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /notifications/read — mark all notifications as read
router.patch('/read', requireAuth, async (req, res) => {
  try {
    await markAllRead(req.user.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
