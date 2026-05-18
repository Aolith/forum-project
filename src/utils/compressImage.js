/**
 * 图片压缩函数
 * @param {File} file - 原始图片文件
 * @param {number} maxPixels - 最大像素数，默认100万（1000×1000）
 * @param {number} quality - JPEG质量，0-1，默认0.8
 * @returns {Promise<File>} 压缩后的图片文件
 */
export function compressImage(file, maxPixels = 1000000, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        let width = img.width
        let height = img.height
        if (width * height > maxPixels) {
          const ratio = Math.sqrt(maxPixels / (width * height))
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        }, 'image/jpeg', quality)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}