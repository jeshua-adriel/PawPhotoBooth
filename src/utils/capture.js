import { FRAME_DECOR } from './filters.js'

/** Grabs a filtered, center-cropped frame from a <video> at the given aspect ratio. */
export function grabVideoFrame(video, aspect, { mirror = false, filterCss = 'none', boxWidth = 480 } = {}) {
  const canvas = document.createElement('canvas')
  const outW = boxWidth
  const outH = Math.round(outW / aspect)
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')

  const hasFrame = video && video.videoWidth > 0 && video.readyState >= 2
  if (!hasFrame) {
    drawPlaceholder(ctx, outW, outH)
    return canvas
  }

  const vw = video.videoWidth, vh = video.videoHeight
  const vAspect = vw / vh
  let sx, sy, sw, sh
  if (vAspect > aspect) { sh = vh; sw = vh * aspect; sx = (vw - sw) / 2; sy = 0 }
  else { sw = vw; sh = vw / aspect; sx = 0; sy = (vh - sh) / 2 }

  ctx.filter = filterCss
  ctx.save()
  if (mirror) { ctx.translate(outW, 0); ctx.scale(-1, 1) }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH)
  ctx.restore()
  return canvas
}

function drawPlaceholder(ctx, w, h) {
  ctx.fillStyle = '#EFE9FB'
  ctx.fillRect(0, 0, w, h)
  ctx.font = Math.round(w * 0.16) + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = 0.7
  ctx.fillText('💌', w / 2, h / 2 - h * 0.06)
  ctx.font = '600 ' + Math.round(w * 0.06) + 'px Quicksand, sans-serif'
  ctx.fillStyle = '#6B6485'
  ctx.globalAlpha = 1
  ctx.fillText('waiting for partner', w / 2, h / 2 + h * 0.16)
}

function drawCornerDecor(ctx, w, h, decorKey) {
  const decor = FRAME_DECOR[decorKey]
  if (!decor || !decor.glyphs) return
  const g = decor.glyphs
  ctx.save()
  ctx.font = Math.round(w * 0.06) + 'px sans-serif'
  ctx.textBaseline = 'top'
  ctx.globalAlpha = 0.92
  const pad = w * 0.02
  ctx.textAlign = 'left'; ctx.fillText(g[0], pad, pad)
  ctx.textAlign = 'right'; ctx.fillText(g[1], w - pad, pad)
  ctx.textAlign = 'left'; ctx.fillText(g[2], pad, h - pad - w * 0.07)
  ctx.textAlign = 'right'; ctx.fillText(g[3], w - pad, h - pad - w * 0.07)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = w * 0.012
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)
  ctx.restore()
}

/**
 * Combines the two per-person frames into one "couple" canvas, side by side
 * or stacked, with a divider and an optional decorated border.
 */
export function composeCoupleFrame(frameA, frameB, arrangement, decorKey) {
  const gap = 10
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (arrangement === 'stacked') {
    canvas.width = frameA.width
    canvas.height = frameA.height + frameB.height + gap
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(frameA, 0, 0)
    ctx.drawImage(frameB, 0, frameA.height + gap)
  } else {
    canvas.width = frameA.width + frameB.width + gap
    canvas.height = frameA.height
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(frameA, 0, 0)
    ctx.drawImage(frameB, frameA.width + gap, 0)
  }

  drawCornerDecor(ctx, canvas.width, canvas.height, decorKey)
  return canvas
}

/** Stacks three couple frames into one tall branded strip, like the original single-camera version. */
export function composeCoupleStrip(coupleFrames) {
  const pad = 26, gap = 16
  const fw = Math.max(...coupleFrames.map((f) => f.width))
  const headerH = 84, footerH = 66
  const outW = fw + pad * 2
  const frameHeights = coupleFrames.map((f) => Math.round(f.height * (fw / f.width)))
  const outH = headerH + frameHeights.reduce((a, b) => a + b, 0) + gap * (coupleFrames.length - 1) + footerH + pad * 2

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FBF6EF'
  ctx.fillRect(0, 0, outW, outH)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#3A3352'
  ctx.font = '700 34px "Baloo 2", sans-serif'
  ctx.fillText('🐾 PawShoot', outW / 2, pad + 8)
  ctx.font = '600 15px Quicksand, sans-serif'
  ctx.fillStyle = '#6B6485'
  ctx.fillText(new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }), outW / 2, pad + 46)

  let y = headerH
  coupleFrames.forEach((frame, i) => {
    const fh = frameHeights[i]
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.fillRect(pad - 3, y - 3, fw + 6, fh + 6)
    ctx.drawImage(frame, 0, 0, frame.width, frame.height, pad, y, fw, fh)
    ctx.restore()
    y += fh + gap
  })

  ctx.font = '22px sans-serif'
  ctx.fillText('🐾  💕  🐾', outW / 2, outH - footerH + 10)
  ctx.font = '600 14px Quicksand, sans-serif'
  ctx.fillStyle = '#6B6485'
  ctx.fillText('Say Cheese!', outW / 2, outH - footerH + 40)

  return canvas
}
