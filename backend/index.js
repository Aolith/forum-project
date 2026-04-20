//通过express搭建Web服务器
const express=require("express")

const app=express()
const port=3001

//用get请求访问路径
app.get('/', (req, res) => {
  res.send('Hello Express')
})

app.listen(port,()=>{
  console.log(`服务器在${port}端口启动成功`)
})

