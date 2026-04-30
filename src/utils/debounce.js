//防抖：触发后等 n 秒，重新触发则重新计时
//用于后续搜索框
export function debounce(fn,delay=300){
  let timer = null
  return function(...args){
    if(timer) clearTimeout(timer)
    timer = setTimeout(()=>{
      fn.apply(this,args)
    },delay)
  }
}