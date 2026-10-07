import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import Camera from './pages/CameraPage.jsx'
import Gallery from './pages/GalleryPage.jsx'
import Settings from './pages/SettingsPage.jsx'
import Toast from './components/Toast.jsx'
import ShareSheet from './components/ShareSheet.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useToast } from './hooks/useToast.js'
import { useCamera } from './hooks/useCamera.js'
import { usePeerRoom } from './hooks/usePeerRoom.js'
import { DEFAULT_SETTINGS } from './utils/filters.js'

const TABS = [
  { id: 'home', label: '🏠 Home' },
  { id: 'booth', label: '📸 Booth' },
  { id: 'gallery', label: '🎞️ Gallery' },
  { id: 'settings', label: '⚙️ Settings' },
]

export default function App() {
  // A link shared from the "Create Room" flow looks like /?room=abc123 —
  // land straight in the Booth so the partner doesn't have to hunt for the tab.
  const initialTab = useMemo(() => (
    new URLSearchParams(window.location.search).get('room') ? 'booth' : 'home'
  ), [])

  const [tab, setTab] = useState(initialTab)
  const [settings, setSettings] = useLocalStorage('pawshoot_settings_v2', DEFAULT_SETTINGS)
  const [photos, setPhotos] = useLocalStorage('pawshoot_gallery_v2', [])
  const [shareEntry, setShareEntry] = useState(null)
  const { message, showToast } = useToast()


  const camera = useCamera()
  const peer = usePeerRoom(camera.stream)
  const autoJoinedRef = useRef(false)
  const roomParam = useMemo(() => new URLSearchParams(window.location.search).get('room'), [])

  const isHost = !roomParam

 
  function clearRoomFromUrl() {
    const url = new URL(window.location.href)
    url.searchParams.delete('room')
    window.history.replaceState({}, '', url.toString())
  }


  function endSession() {
    peer.leaveRoom(isHost ? 'host' : 'guest')
    clearRoomFromUrl()
  }

  
  useEffect(() => {
    if (tab === 'booth' && !camera.stream) camera.start('user')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // Arrived via a shared invite link — auto-join once, and only if not already connected.
  useEffect(() => {
    if (roomParam && peer.myId && peer.status === 'ready' && !autoJoinedRef.current) {
      autoJoinedRef.current = true
      peer.joinRoom(roomParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomParam, peer.myId, peer.status])


  const skipBroadcastRef = useRef(false)


  useEffect(() => {
    if (!peer.dataReady) return
    if (skipBroadcastRef.current) { skipBroadcastRef.current = false; return }
    peer.sendData({ type: 'settings', payload: settings })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, peer.dataReady])

  useEffect(() => {
    const msg = peer.lastMessage
    if (!msg || !msg.data) return

    if (msg.data.type === 'settings') {
      skipBroadcastRef.current = true
      setSettings(msg.data.payload)
    } else if (msg.data.type === 'photo') {
      addPhoto(msg.data.payload)
      showToast('Your partner captured a shot — saved to your gallery too 🐾')
    } else if (msg.data.type === 'leave') {
      if (msg.data.role === 'host') {
        // The host ended the whole session — fully exit on our (guest) side too.
        clearRoomFromUrl()
        showToast('Your partner ended the session 💔')
      } else {
        // Just the guest leaving — our room (if we're the host) stays open.
        showToast('Your partner left — your room is still open for a new guest 🐾')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer.lastMessage])

  useEffect(() => {
    const field = document.getElementById('pawField')
    if (!field || field.childElementCount) return
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div')
      p.className = 'paw'
      p.textContent = '🐾'
      p.style.left = Math.random() * 100 + 'vw'
      p.style.top = Math.random() * 100 + 'vh'
      p.style.setProperty('--rot', (Math.random() * 70 - 35) + 'deg')
      p.style.fontSize = (18 + Math.random() * 22) + 'px'
      field.appendChild(p)
    }
  }, [])

  function addPhoto(entry) {
    setPhotos((prev) => [entry, ...prev])
  }

  function deletePhoto(id) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    showToast('Photo removed 🗑️')
  }

  return (
    <>
      <div className="paw-field" id="pawField"></div>
      <div className="wrap">
        <header className="top">
          <button className="brand" onClick={() => setTab('home')}>
            <div className="mark">🐾</div>
            <div>
              <div className="name">Paw<span>Shoot</span></div>
              <div className="tag">the friendliest little photobooth</div>
            </div>
          </button>
          <nav className="mode-toggle" role="tablist" aria-label="Section">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? 'active' : ''}
                onClick={() => setTab(t.id)}
              >
                {t.label}{t.id === 'gallery' && photos.length ? ` (${photos.length})` : ''}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'home' && <HomePage onStart={() => setTab('booth')} onNavigate={setTab} />}

        {tab === 'booth' && (
          <Camera
            settings={settings}
            photos={photos}
            addPhoto={addPhoto}
            showToast={showToast}
            onOpenShare={setShareEntry}
            camera={camera}
            peer={peer}
            onLeaveSession={endSession}
          />
        )}

        {tab === 'gallery' && (
          <Gallery
            photos={photos}
            onDelete={deletePhoto}
            onShare={setShareEntry}
            showToast={showToast}
          />
        )}

        {tab === 'settings' && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            showToast={showToast}
            onGoBooth={() => setTab('booth')}
          />
        )}

        <footer className="foot">Made with 🐾 for tablet, phone &amp; desktop — strike a pose, save it, share it.</footer>
      </div>

      <div className="print-area" id="printArea"><img id="printImg" alt="Print" /></div>

      {shareEntry && (
        <ShareSheet entry={shareEntry} onClose={() => setShareEntry(null)} showToast={showToast} />
      )}

      <Toast message={message} />
    </>
  )
}