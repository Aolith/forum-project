//节流函数：固定时间间隔内只执行一次
//用于滚动加载更多帖子，防止短时间内多次触底事件导致多次请求
export function throttle(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
