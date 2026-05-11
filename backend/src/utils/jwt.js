const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { sign, verify };
