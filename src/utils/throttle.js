//节流函数：固定时间间隔内只执行一次
//用于滚动加载更多帖子，防止短时间内多次触底事件导致多次请求
export function throttle(fn,interval=1000){
  let lastTime=0
  return function(...args){
    const now =Date.now()
    if(now-lastTime>=interval){
      lastTime=now
      fn.apply(this,args)
    }
  }
}