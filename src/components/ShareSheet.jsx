import { dataURLtoBlob, downloadPhoto } from '../utils/share.js'

const PLATFORMS = [
  { id: 'native', label: 'Share…', className: 'native', icon: '📤' },
  { id: 'fb', label: 'Facebook', className: 'fb', icon: 'f' },
  { id: 'mg', label: 'Messenger', className: 'mg', icon: '💬' },
  { id: 'ig', label: 'Instagram', className: 'ig', icon: '📷' },
  { id: 'tw', label: 'X / Twitter', className: 'tw', icon: '𝕏' },
  { id: 'sc', label: 'Snapchat', className: 'sc', icon: '👻' },
  { id: 'wa', label: 'WhatsApp', className: 'wa', icon: '☎' },
  { id: 'copy', label: 'Copy image', className: 'copy', icon: '📋' },
]

export default function ShareSheet({ entry, onClose, showToast }) {
  if (!entry) return null

  async function handlePick(platform) {
    const blob = dataURLtoBlob(entry.src)
    const file = new File([blob], 'pawshoot.jpg', { type: 'image/jpeg' })

    if (platform === 'native') {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'PawShoot photo', text: 'Look at this cute PawShoot photo! 🐾' })
          onClose()
        } catch { /* user cancelled */ }
      } else {
        showToast("Your browser doesn't support direct sharing — try Copy image instead 🐾")
      }
      return
    }

    if (platform === 'copy') {
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/jpeg': blob })])
          showToast('Copied! Paste it into any app 📋')
        } else {
          throw new Error('no clipboard image support')
        }
      } catch {
        downloadPhoto(entry)
        showToast("Copy isn't supported here — downloaded instead, ready to attach 📎")
      }
      return
    }

    const urls = {
      fb: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href),
      mg: 'fb-messenger://share?link=' + encodeURIComponent(location.href),
      tw: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Check out my PawShoot photo! 🐾'),
      wa: 'https://wa.me/?text=' + encodeURIComponent('Look at this cute photo I took on PawShoot! 🐾'),
      ig: null,
      sc: null,
    }

    downloadPhoto(entry)
    if (urls[platform]) {
      window.open(urls[platform], '_blank')
      showToast('Photo downloaded — attach it in the window that just opened 📎')
    } else {
      showToast('Photo downloaded — open ' + (platform === 'ig' ? 'Instagram' : 'Snapchat') + ' and attach it from your gallery 📎')
    }
  }

  return (
    <div className="sheet-backdrop show" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <h3>Share this shot</h3>
        <div className="sub">Pick where the cuteness goes ✨</div>
        <img src={entry.src} alt="Photo to share" />
        <div className="share-grid">
          {PLATFORMS.map((p) => (
            <button key={p.id} onClick={() => handlePick(p.id)}>
              <div className={'ic ' + p.className}>{p.icon}</div>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-ghost sheet-close" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
