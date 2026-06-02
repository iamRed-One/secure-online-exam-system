const pool = require('../../db/client');

/**
 * Create a notification, skipping silently if an identical one already exists
 * (same user_id + type + exam_id). Prevents duplicate reminders.
 */
async function createNotification(userId, type, message, examId = null) {
  const existing = await pool.query(
    `SELECT 1 FROM notifications
     WHERE user_id=$1 AND type=$2
       AND (($3::uuid IS NULL AND exam_id IS NULL) OR exam_id=$3::uuid)
     LIMIT 1`,
    [userId, type, examId]
  );
  if (existing.rows.length > 0) return;

  await pool.query(
    `INSERT INTO notifications (user_id, type, message, exam_id) VALUES ($1,$2,$3,$4)`,
    [userId, type, message, examId]
  );
}

async function getNotifications(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id=$1
     ORDER BY created_at DESC
     LIMIT 30`,
    [userId]
  );
  return rows;
}

async function getUnreadCount(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND read=FALSE`,
    [userId]
  );
  return parseInt(rows[0].count, 10);
}

async function markAllRead(userId) {
  await pool.query(`UPDATE notifications SET read=TRUE WHERE user_id=$1 AND read=FALSE`, [userId]);
}

module.exports = { createNotification, getNotifications, getUnreadCount, markAllRead };
