import '../styles/home.css'

export default function HomePage({onStart, onNavigate}) {
    return (
        <section className = "view active">
            <div className = "hero">
                <div className = "critters">
                    <span>🐶</span><span>🐱</span>
                </div>
                <h1>Selfie <em>PawShoot</em></h1>
                <p className = "sub">
                    A tiny, adorable photobooth for two; pose together from anywhere with a shareable
                    link, add a cute filter, and save it as a single card or a photo strip.
                </p>
                <button className="btn btn-primary cta" onClick={onStart}>📸 Start Photoshoot</button>
                
                <div className="feature-row">

                    <button className="feature-card" onClick={() => onNavigate('gallery')}>
                        <span className="ic">🎞️</span>
                        <h3>Gallery</h3>
                        <p>Every shot is saved right on this device: browse, print, or share it anytime.</p>
                    </button>
                    <button className="feature-card" onClick={() => onNavigate('settings')}>
                        <span className="ic">🎨</span>
                        <h3>filter &amp; card style</h3>
                        <p>Warm, Cool, black &amp; white and more: plus single cards or a 3-shot strip.</p>
                    </button>
                    <button className="feature-card" onClick={(onStart)}>
                        <span className="ic">💕</span>
                        <h3>Photobooth 4 U</h3>
                        <p>Create a room, send the link to your partner, and pose together in real time.</p>
                    </button>
                </div>
            </div>
        </section>
    )
}