const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

router.post('/signup', asyncHandler(async (req, res) => {
    const { secret, email, password } = req.body
  
    if (!secret || !email || !password) {
      res.status(400)
      throw new Error('Please add all fields')
    }
  
    // Check if user exists
    const userExists = await User.findOne({ email })
  
    if (userExists) {
      res.status(400)
      throw new Error('User already exists')
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
    // Create user
    const user = await User.create({
      secret,
      email,
      password: hashedPassword,
    })
  
    if (user) {
      res.status(201).json({
        _id: user.id,
        secret: user.secret,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      res.status(400)
      throw new Error('Invalid user data')
    }
  }));

router.post('/signin', asyncHandler(async (req, res) => {
    const { email, password } = req.body
  
    // Check for user email
    const user = await User.findOne({ email })
  
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        secret: user.secret,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      res.status(400)
      throw new Error('Invalid credentials')
    }
  }));

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
  }

router.get('/signup', (req, res) => {
    res.sendFile(process.cwd() + '/public/signup.html');
})

module.exports = router;