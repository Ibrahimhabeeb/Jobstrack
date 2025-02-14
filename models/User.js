const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
  },

  lastname:{
    type: String,
  trim :true,
  default: 'lastname',
   maxlength: 30
  },

  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  location:{
    type: String,
    default: 'My City',
    maxlength: 200


  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },

  
})

UserSchema.pre('save', async function () {
  if(!this.isModified('password'))return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    fs.readFileSync('/run/secrets/jwt_secret', 'utf-8').trim(),
    {
      expiresIn: fs.readFileSync('/run/secrets/jwt_secret', 'utf-8').trim(),
    }
  )
}

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
