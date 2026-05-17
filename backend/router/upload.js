const express = require('express')
const qiniu = require('qiniu')
const router = express.Router()

const accessKey = process.env.QINIU_ACCESS_KEY
const secretKey = process.env.QINIU_SECRET_KEY
const bucket = process.env.QINIU_BUCKET

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
const putPolicy = new qiniu.rs.PutPolicy({ 
  scope: bucket, 
  expires: 7200,
  returnBody: '{"key":"$(key)","hash":"$(etag)"}'
})

router.get('/upload-token', (req, res) => {
  const uploadToken = putPolicy.uploadToken(mac)
  res.json({ token: uploadToken })
})

module.exports = router