import { useState } from 'react'
import '../styles/settings.css'
import { FILTERS, FILTER_ORDER, FRAME_DECOR, FRAME_DECOR_ORDER } from '../utils/filters.js'

export default function Settings({ settings, setSettings, showToast, onGoBooth }) {
  const [savedFlash, setSavedFlash] = useState(false)

  function update(patch) {
    setSettings((prev) => ({ ...prev, ...patch }))
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1400)
  }

  return (
    <section className="view active">
      <div className="settings-grid">
        <div className="panel">
          <h2>🎨 Picture filter</h2>
          <div className="sub">Applied live in the booth and baked into every saved photo.</div>
          <div className="filter-grid">
            {FILTER_ORDER.map((key) => {
              const f = FILTERS[key]
              return (
                <div
                  key={key}
                  className={'filter-opt' + (settings.filter === key ? ' active' : '')}
                  onClick={() => update({ filter: key })}
                >
                  <div className="filter-swatch" style={{ filter: f.css }}></div>
                  <span>{f.emoji} {f.label}</span>
                </div>
              )
            })}
          </div>

          <h2 style={{ marginTop: 22 }}>🖼️ Corner frame</h2>
          <div className="sub">Decorates the border of every couple photo.</div>
          <div className="sticker-picker">
            {FRAME_DECOR_ORDER.map((key) => (
              <span
                key={key}
                className={'chip' + (settings.frameDecor === key ? ' active' : '')}
                onClick={() => update({ frameDecor: key })}
              >
                {FRAME_DECOR[key].emoji} {FRAME_DECOR[key].label}
              </span>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>💕 Couple photo layout</h2>
          <div className="sub">Choose how the two camera boxes sit together, and how each capture is composed.</div>

          <div className="layout-row">
            <div
              className={'layout-opt' + (settings.arrangement === 'side' ? ' active' : '')}
              onClick={() => update({ arrangement: 'side' })}
            >
              <div className="layout-preview">
                <div className="lp-card lp-side-a"></div>
                <div className="lp-card lp-side-b"></div>
              </div>
              <div className="layout-text"><strong>Side by side</strong><span>Two camera boxes next to each other</span></div>
            </div>
            <div
              className={'layout-opt' + (settings.arrangement === 'stacked' ? ' active' : '')}
              onClick={() => update({ arrangement: 'stacked' })}
            >
              <div className="layout-preview lp-stack">
                <div className="lp-card lp-stack-a"></div>
                <div className="lp-card lp-stack-b"></div>
              </div>
              <div className="layout-text"><strong>Stacked</strong><span>One camera box above the other</span></div>
            </div>
          </div>

          <div className="layout-row" style={{ marginTop: 14 }}>
            <div
              className={'layout-opt' + (settings.cardStyle === 'single' ? ' active' : '')}
              onClick={() => update({ cardStyle: 'single' })}
            >
              <div className="layout-preview"><div className="lp-card lp-landscape"></div></div>
              <div className="layout-text"><strong>Single photo</strong><span>One combined shot per capture</span></div>
            </div>
            <div
              className={'layout-opt' + (settings.cardStyle === 'strip' ? ' active' : '')}
              onClick={() => update({ cardStyle: 'strip' })}
            >
              <div className="layout-preview">
                <div className="lp-strip-stack">
                  <div className="lp-card lp-strip"></div>
                  <div className="lp-card lp-strip"></div>
                  <div className="lp-card lp-strip"></div>
                </div>
              </div>
              <div className="layout-text"><strong>Photo strip</strong><span>3 quick combined shots in one tall card</span></div>
            </div>
          </div>

          <div className="save-row">
            <button className="btn btn-secondary" onClick={onGoBooth}>📸 Try it in the Booth</button>
            <span className={'saved-msg' + (savedFlash ? ' show' : '')}>Saved ✓</span>
          </div>
        </div>
      </div>
    </section>
  )
}
