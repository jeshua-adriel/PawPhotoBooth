export function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8 = new Uint8Array(n)
  while (n--) u8[n] = bstr.charCodeAt(n)
  return new Blob([u8], { type: mime })
}

export function downloadPhoto(entry) {
  const a = document.createElement('a')
  a.href = entry.src
  a.download = 'pawshoot-' + entry.id + '.jpg'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function printPhoto(entry) {
  const printImg = document.getElementById('printImg')
  if (!printImg) return
  printImg.src = entry.src
  setTimeout(() => window.print(), 80)
}
