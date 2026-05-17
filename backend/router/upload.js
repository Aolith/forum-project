const express = require('express')
const cloudinary = require('cloudinary').v2
const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/upload-signature', (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'forum/avatars' }, 
    process.env.CLOUDINARY_API_SECRET
  )
  res.json({ timestamp, signature: signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME })
})

module.exports = router