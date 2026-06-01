const express = require('express')
const carpoolRouter = express.Router()
const auth = require('../middleware/auth')
const Carpool=require('../models/Carpool')
const Notification=require('../models/Notification')

//获取拼车信息
carpoolRouter.get('/', auth, async (req, res) => {
  try {
    const myCarpool = await Carpool.findOne({ user: req.user._id, status: 'active' })
    if (!myCarpool) {
      return res.json([])
    }
    const { destination, departureTime } = req.query
    const now = new Date()
    const filter = {
      status: 'active',
      expireAt: { $gt: now },
    }

    if (destination) {
      filter.destination = destination
    }

    if (departureTime) {
      const depDate = new Date(departureTime)
      if (isNaN(depDate.getTime())) {
        return res.status(400).json({ error: '出发时间格式不正确' })
      }
      const twentyMin = 20 * 60 * 1000
      filter.departureTime = {
        $gte: new Date(depDate.getTime() - twentyMin),
        $lte: new Date(depDate.getTime() + twentyMin)
      }
    }

    const carpools = await Carpool.find(filter)
      .populate('user', 'name')
      .sort({ departureTime: 1 })

    res.json(carpools)
  } catch (err) {
    console.error('获取拼车信息失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})
//查看微信
carpoolRouter.get('/:id/contact', auth, async (req, res) => { 
  try { 
    const carpool = await Carpool.findById(req.params.id).populate('user', 'wechat name')
    if (!carpool) return res.status(404).json({ error: '拼车信息不存在' })

    const userId = req.user._id.toString()
    const isOwner = carpool.user._id.toString() === userId
    const isApproved = carpool.applicants.some(
      a => a.user.toString() === userId && a.status === 'accepted'
    )
    if (!isOwner&&!isApproved) {
      return res.status(403).json({ error: '没有权限查看微信号' })
    }
    res.json({ wechat: carpool.user.wechat })
  } catch (err) { 
    console.error('查看微信号失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//获取用户发布的拼车信息
carpoolRouter.get('/:id',auth, async (req, res) => { 
  try {
    const carpool=await Carpool.findById(req.params.id)
       .populate('user','name')
    if (!carpool) {
      return res.status(404).json({ error: '拼车信息不存在' })
    }
    if(carpool.status!=='active'){
      return res.status(400).json({ error: '拼车信息已失效' })
    }
    res.json(carpool)
  } catch (err) {
    console.error('获取用户发布的拼车信息失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//发布拼车信息
carpoolRouter.post('/',auth, async (req, res) => { 
  try {
    const {departureTime,destination}=req.body
    if(!departureTime || !destination){
      return res.status(400).json({ error: '请填写出发时间和目的地' })
    }
    const departureDate = new Date(departureTime)
    // 校验是否为有效时间
    if (isNaN(departureDate.getTime())) {
      return res.status(400).json({ error: '出发时间格式不正确' })
    }
    if (departureDate <= new Date()) {
      return res.status(400).json({ error: '出发时间必须是将来的时间' })
    }
    if(!req.user.wechat){
      return res.status(400).json({ error: '请先去主页绑定微信号' })
    }
    const newCarpool=new Carpool({
      user:req.user._id,
      wechat:req.user.wechat,
      departureTime:departureDate,
      destination,
      expireAt: new Date(departureDate.getTime() + 60 * 60 * 1000)
    })
    let createdCarpool=await newCarpool.save()
    createdCarpool=await createdCarpool.populate('user','name')
    res.status(201).json(createdCarpool)
  } catch (err) {
    console.error('发布拼车信息失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//删除拼车信息
carpoolRouter.delete('/:id',auth, async (req, res) => {
  try {
    const id = req.params.id
    const carpool = await Carpool.findById(id)
    if (!carpool) {
      return res.status(404).json({ error: '拼车信息不存在' })
    }
    if (carpool.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '只能取消自己的拼车信息' })
    }
    if(carpool.expireAt < Date.now()){
      return res.status(400).json({ error: '拼车信息已过期' })
    }
    if(carpool.status==='cancelled'){
      return res.status(400).json({ error: '拼车信息已被取消' })
    }
    await Carpool.deleteOne({ _id: id })
    res.json(carpool)
  } catch (err) {
    console.error('取消拼车信息失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  } 
})

//申请拼车
carpoolRouter.post('/:id/apply',auth, async (req, res) => {
  try { 
    const carpool=await Carpool.findById(req.params.id)
    if (!carpool) {
      return res.status(404).json({ error: '拼车信息不存在' })
    }
    if(carpool.status !== 'active'){
      return res.status(400).json({ error: '拼车信息已失效' })
    }
    if(carpool.user.toString() === req.user._id.toString()){
      return res.status(400).json({ error: '不能申请自己的拼车信息' })
    }
    // 检查是否已经申请过
    const existingApplicant = carpool.applicants.find(app => app.user.toString() === req.user._id.toString())
    if (existingApplicant) {
      return res.status(400).json({ error: '你已经申请过这个拼车信息了' })
    }
    // 添加申请人
    carpool.applicants.push({ user: req.user._id })
    await carpool.save()
    // 发通知给拼车发布者
    await new Notification({
      type: 'carpool_request',
      sender: req.user._id,
      receiver: carpool.user,
      carpoolId: carpool._id,
      isRead: false
    }).save()
    res.json({ message: '申请已发送' })
  } catch (err) {
    console.error('申请拼车失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  } 
})

//删除申请
carpoolRouter.delete('/:id/apply', auth, async (req, res) => {
  try { 
  } catch (err) {
    console.error('删除申请失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  } 
})
// 同意申请
carpoolRouter.put('/:id/approve', auth, async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id)
    if (!carpool) return res.status(404).json({ error: '拼车信息不存在' })
    if (carpool.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '只有发布者才能同意申请' })
    }

    const { applicantId } = req.body
    if (!applicantId) return res.status(400).json({ error: '缺少申请人ID' })

    const applicant = carpool.applicants.find(
      a => a.user.toString() === applicantId
    )
    if (!applicant) return res.status(404).json({ error: '未找到该申请记录' })
    if (applicant.status !== 'pending') {
      return res.status(400).json({ error: '该申请已处理过' })
    }

    applicant.status = 'accepted'
    await carpool.save()

    // 发通知给申请人
    await new Notification({
      type: 'carpool_approve',
      sender: req.user._id,
      receiver: applicantId,
      carpoolId: carpool._id,
      isRead: false
    }).save()

    res.json({ message: '已同意对方查看微信号' })
  } catch (err) {
    console.error('同意拼车申请失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

//拒绝申请
carpoolRouter.put('/:id/reject', auth, async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id)
    if (!carpool) return res.status(404).json({ error: '拼车信息不存在' })
    if (carpool.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '只有发布者才能拒绝申请' })
    }

    const { applicantId } = req.body
    if (!applicantId) return res.status(400).json({ error: '缺少申请人ID' })

    const applicant = carpool.applicants.find(
      a => a.user.toString() === applicantId
    )
    if (!applicant) return res.status(404).json({ error: '未找到该申请记录' })
    if (applicant.status !== 'pending') {
      return res.status(400).json({ error: '该申请已处理过' })
    }

    applicant.status = 'rejected'
    await carpool.save()

    // 发通知给申请人
    await new Notification({
      type: 'carpool_reject',
      sender: req.user._id,
      receiver: applicantId,
      carpoolId: carpool._id,
      isRead: false
    }).save()

    res.json({ message: '已拒绝该申请' })
  } catch (err) {
    console.error('拒绝拼车申请失败', err)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

module.exports = carpoolRouter