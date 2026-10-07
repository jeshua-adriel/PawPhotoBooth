import '../styles/gallery.css'
import { downloadPhoto, printPhoto } from '../utils/share.js'

export default function Gallery({ photos, onDelete, onShare, showToast }) {
  return (
    <section className="view active">
      <h2>Your photo strip 🎞️</h2>
      <div className="sub">Saved right on this device. Download, print, or share any shot.</div>

      {photos.length === 0 && (
        <div className="empty">
          <span className="e">🐾</span>
          No photos yet — go strike a pose in the Booth!
        </div>
      )}

      <div className="gallery wide">
        {photos.map((entry) => (
          <div className="shot" key={entry.id}>
            <span className="badge">
              {new Date(entry.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span className="badge layout">{entry.layout === 'strip' ? 'Strip' : 'Single'}</span>
            <img src={entry.src} alt="Captured photo" />
            <div className="bar">
              <button title="Save softcopy" onClick={() => { downloadPhoto(entry); showToast('Softcopy saved to your downloads ✨') }}>⬇️</button>
              <button title="Print" onClick={() => printPhoto(entry)}>🖨️</button>
              <button title="Share" onClick={() => onShare(entry)}>📤</button>
              <button title="Delete" onClick={() => onDelete(entry.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
