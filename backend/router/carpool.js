const express = require('express')
const carpoolRouter = express.Router()
const auth = require('../middleware/auth')
const Carpool=require('../models/Carpool')

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

//取消拼车信息
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



module.exports = carpoolRouter