const mongoose = require('mongoose')

const whitelistSchema = new mongoose.Schema({
  sno: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Whitelist', whitelistSchema)