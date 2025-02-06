const express = require('express')
const router = express.Router()
const authorization = require('../middleware/authentication')
const { register, login, updateUser } = require('../controllers/auth')
const rateLimiter = require('express-rate-limit');
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    msg: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
router.post('/register', apiLimiter ,register)
router.post('/login', apiLimiter, login)
router.patch('/updateUser',authorization,updateUser )
module.exports = router
