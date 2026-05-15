const sensitiveWords = require('./sensitiveWords')

function filterSensitiveWords(text) {
  if (!text || typeof text !== 'string') {
    return { filtered: text, blocked: false, crisis: false }
  }

  let filtered = text
  let blocked = false

  // 必拦级：检测到直接标记
  sensitiveWords.block.forEach(word => {
    if (text.includes(word)) {
      blocked = true
      filtered = filtered.replace(new RegExp(word, 'g'), '*'.repeat(word.length))
    }
  })

  // 预警级：替换为*号
  sensitiveWords.warn.forEach(word => {
    filtered = filtered.replace(new RegExp(word, 'g'), '*'.repeat(word.length))
  })

  return { filtered, blocked,  }
}

module.exports = filterSensitiveWords