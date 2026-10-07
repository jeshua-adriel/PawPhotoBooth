import { useEffect, useRef, useState } from 'react'
import '../styles/camera.css'
import { FILTERS, FRAME_DECOR, FRAME_DECOR_ORDER } from '../utils/filters.js'
import { grabVideoFrame, composeCoupleFrame, composeCoupleStrip } from '../utils/capture.js'

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

// `camera` and `peer` are created once in App.jsx and passed in as props, so
// leaving this page (e.g. to open Settings) and coming back does NOT create a
// new camera stream or a new peer ID — the session survives navigation. The
// only way to actually end the call is the "Leave session" button below.
export default function Camera({ settings, photos, addPhoto, showToast, onOpenShare, camera, peer, onLeaveSession }) {
  const settingsSynced = peer.status === 'connected' && peer.dataReady
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const [joinCode, setJoinCode] = useState('')
  const [frameDecor, setFrameDecor] = useState(settings.frameDecor)
  const [busy, setBusy] = useState(false)
  const [shotProgress, setShotProgress] = useState('')
  const [countdownNum, setCountdownNum] = useState(null)
  const [flashGo, setFlashGo] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Wire the live streams to the two <video> elements.
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = camera.stream || null
  }, [camera.stream])
  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = peer.remoteStream || null
  }, [peer.remoteStream])

  useEffect(() => { if (camera.error) showToast(camera.error) }, [camera.error, showToast])

  function shareableLink() {
    const url = new URL(window.location.href)
    url.searchParams.set('room', peer.myId)
    return url.toString()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareableLink())
      setLinkCopied(true)
      showToast('Link copied — send it to your partner 💌')
      setTimeout(() => setLinkCopied(false), 1600)
    } catch {
      showToast("Couldn't copy — copy the link manually")
    }
  }

  async function runCountdown() {
    for (let n = 3; n >= 1; n--) {
      setCountdownNum(n)
      await sleep(700)
    }
    setCountdownNum(null)
    setFlashGo(true)
    setTimeout(() => setFlashGo(false), 460)
  }

  function grabPair(aspect) {
    const local = grabVideoFrame(localVideoRef.current, aspect, {
      mirror: true, filterCss: FILTERS[settings.filter].css, boxWidth: 440,
    })
    const remote = grabVideoFrame(remoteVideoRef.current, aspect, {
      mirror: false, filterCss: FILTERS[settings.filter].css, boxWidth: 440,
    })
    return [local, remote]
  }

  // Saves the exact same finished image to whoever captured it AND, if a
  // partner is connected, sends it over the data channel so it lands in
  // their gallery too — both sides end up with an identical copy.
  function saveAndShare(entry) {
    addPhoto(entry)
    peer.sendData({ type: 'photo', payload: entry })
  }

  async function captureSingle() {
    setBusy(true)
    await runCountdown()
    const aspect = settings.arrangement === 'stacked' ? 4 / 3 : 3 / 4
    const [local, remote] = grabPair(aspect)
    const canvas = composeCoupleFrame(local, remote, settings.arrangement, frameDecor)
    saveAndShare({ id: 'p' + Date.now(), src: canvas.toDataURL('image/jpeg', 0.92), layout: 'single', ts: new Date().toISOString() })
    showToast('Say cheese! Saved to your gallery 🐾')
    setBusy(false)
  }

  async function captureStrip() {
    setBusy(true)
    const aspect = settings.arrangement === 'stacked' ? 4 / 3 : 3 / 4
    const coupleFrames = []
    for (let i = 0; i < 3; i++) {
      setShotProgress(`Shot ${i + 1} of 3`)
      await runCountdown()
      const [local, remote] = grabPair(aspect)
      coupleFrames.push(composeCoupleFrame(local, remote, settings.arrangement, 'none'))
      await sleep(350)
    }
    setShotProgress('')
    const canvas = composeCoupleStrip(coupleFrames)
    saveAndShare({ id: 'p' + Date.now(), src: canvas.toDataURL('image/jpeg', 0.92), layout: 'strip', ts: new Date().toISOString() })
    showToast('Strip complete — 3 cute shots saved! 🐾')
    setBusy(false)
  }

  const statusLabel = {
    offline: 'Starting…',
    ready: 'Room open — share your link',
    connecting: 'Connecting…',
    connected: 'Partner connected 💕',
    error: "Connection hiccup — try again",
  }[peer.status]

  return (
    <section className="view active">
      <div className="stage">
        <div className="booth">
          <div className={'two-frame arrangement-' + settings.arrangement}>
            <div className="frame">
              <video ref={localVideoRef} autoPlay playsInline muted
                style={{ filter: FILTERS[settings.filter].css }} className="mirrored" />
              {!camera.stream && (
                <div className="placeholder">
                  <span className="big">📸</span>
                  Waking up your camera…
                </div>
              )}
              <span className="who-badge">You</span>
            </div>
            <div className="frame">
              <video ref={remoteVideoRef} autoPlay playsInline
                style={{ filter: FILTERS[settings.filter].css }} />
              {!peer.remoteStream && (
                <div className="placeholder">
                  <span className="big">💌</span>
                  {peer.status === 'connecting' ? 'Connecting to your partner…' : 'Waiting for your partner'}
                </div>
              )}
              <span className="who-badge">Partner</span>
            </div>

            {shotProgress && <div className="shot-progress show">{shotProgress}</div>}
            {countdownNum && (
              <div className="countdown show"><div className="num">{countdownNum}</div></div>
            )}
            <div className={'flash' + (flashGo ? ' go' : '')}></div>
          </div>

          <div className="booth-controls">
            <button className="btn btn-primary" onClick={() => camera.start()} disabled={!!camera.stream}>
              🎥 {camera.stream ? 'Camera is on!' : 'Wake up the camera'}
            </button>
            <button
              className="btn btn-sun"
              disabled={!camera.stream || busy}
              onClick={() => (settings.cardStyle === 'strip' ? captureStrip() : captureSingle())}
            >
              📷 Strike a pose!
            </button>
            <button className="btn btn-ghost" onClick={camera.flip} disabled={!camera.stream}>🔄 Flip camera</button>
            <button
              className="btn btn-ghost"
              onClick={onLeaveSession}
              disabled={peer.status !== 'connected' && peer.status !== 'connecting'}
            >
              🚪 Leave session
            </button>
          </div>

          <div className="room-panel">
            <div className="room-status">
              <span className={'dot ' + peer.status}></span>
              {statusLabel}
            </div>
            {peer.status !== 'connected' && peer.myId && (
              <div className="room-controls">
                <button className="btn btn-secondary sm" onClick={copyLink}>
                  {linkCopied ? '✓ Copied' : '🔗 Copy invite link'}
                </button>
                <div className="join-row">
                  <input
                    type="text"
                    placeholder="Paste partner's code or link"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <button
                    className="btn btn-ghost sm"
                    onClick={() => {
                      let id = joinCode.trim()
                      if (id.includes('room=')) {
                        try { id = new URL(id).searchParams.get('room') || id } catch { /* not a full URL, use as-is */ }
                      }
                      peer.joinRoom(id)
                    }}
                    disabled={!joinCode.trim()}
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="sticker-picker">
            {FRAME_DECOR_ORDER.map((key) => (
              <span
                key={key}
                className={'chip' + (frameDecor === key ? ' active' : '')}
                onClick={() => setFrameDecor(key)}
              >
                {FRAME_DECOR[key].emoji} {FRAME_DECOR[key].label}
              </span>
            ))}
          </div>

          <div className="mini-note">
            🎨 Filter: <b>{FILTERS[settings.filter].label}</b> &nbsp;·&nbsp;
            🖼️ Card: <b>{settings.cardStyle === 'strip' ? 'Strip · 3 shots' : 'Single'}</b> &nbsp;·&nbsp;
            💕 Layout: <b>{settings.arrangement === 'stacked' ? 'Stacked' : 'Side by side'}</b>
            &nbsp;— change these in ⚙️ Settings
            {settingsSynced && <>&nbsp;·&nbsp; 🔄 <b>Synced with your partner</b></>}
          </div>
          <p className="hint">
            Your cameras stay device-to-device — video is never uploaded to a server, and nothing is saved
            unless you choose to capture, share, or download a photo.
          </p>
        </div>

        <aside className="side">
          <h2>Latest shots</h2>
          <div className="sub">Your last few captures</div>
          <div className="gallery-mini">
            {photos.slice(0, 4).map((p) => (
              <div className="shot" key={p.id}>
                <img src={p.src} alt="Captured photo" />
                <div className="bar">
                  <button onClick={() => onOpenShare(p)}>📤</button>
                </div>
              </div>
            ))}
          </div>
          {!photos.length && (
            <div className="empty"><span className="e">🐶</span>Your cute captures will show up here.</div>
          )}
        </aside>
      </div>
    </section>
  )
}