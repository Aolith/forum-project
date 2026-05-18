const express = require('express')
const COS = require('cos-nodejs-sdk-v5')
const multer = require('multer')
const router = express.Router()

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
})

const upload = multer({ storage: multer.memoryStorage() })

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '没有图片数据' })

    const fileName = `avatars/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`

    const result = await cos.putObject({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    })

    const url = `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com/${fileName}`
    res.json({ url })
  } catch (err) {
    console.error('图片上传失败', err)
    res.status(500).json({ error: '上传失败' })
  }
})

module.exports = router