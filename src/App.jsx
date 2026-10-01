import './App.css'

const cards = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    badge: 'HOT',
    category: 'Electronics',
    time: 'Today',
    title: 'Rolex Submariner Date - 2024 Unworn',
    location: 'DIFC, Dubai',
    price: 'AED45,000',
    featured: false,
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    badge: 'HOT',
    category: 'Electronics',
    time: '4 hours ago',
    title: 'Gaming PC RTX 4090 Full Setup',
    location: 'Downtown',
    price: 'AED12,500',
    featured: false,
  },
]

const navItems = [
  { label: 'Home', active: true, icon: '⌂' },
  { label: 'Search', active: false, icon: '⌕' },
  { label: 'Sell', active: false, icon: '+' },
  { label: 'Chat', active: false, icon: '◌' },
  { label: 'Profile', active: false, icon: '◩' },
]

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand" aria-label="DubaiZA logo">
          <span className="brand-mark">D</span>
          <span className="brand-text">DubaiZA</span>
        </div>
        <button className="menu-button" type="button" aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </header>

      <main className="content">
        <div className="listing-strip">
          <div className="listing-chip">
            <span className="chip-label">2023</span>
          </div>
          <div className="listing-chip">
            <span className="chip-label">15,000 km</span>
          </div>
          <div className="listing-chip">
            <span className="chip-label">Dubai Marina</span>
          </div>
        </div>

        <div className="price-grid">
          <div className="price-card">
            <div className="price-line">
              <span className="currency">AED</span>
              <span className="amount">210,000</span>
            </div>
            <div className="loc-wrap">
              <span className="pin">◉</span>
              <span>Dubai Marina</span>
            </div>
          </div>

          <div className="price-card alt">
            <div className="price-line">
              <span className="currency">AED/yr</span>
              <span className="amount">185,000</span>
            </div>
            <div className="loc-wrap">
              <span className="pin">◉</span>
              <span>Palm Jumeirah</span>
            </div>
          </div>
        </div>

        <section className="cards-grid" aria-label="Listings">
          {cards.map((item) => (
            <article className="listing-card" key={item.id}>
              <div
                className="listing-image"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <span className="badge">{item.badge}</span>
                <button type="button" className="favorite" aria-label="Add to favorites">
                  ♡
                </button>

                <div className="card-actions">
                  <button type="button">Call</button>
                  <button type="button">Chat</button>
                </div>
              </div>

              <div className="listing-body">
                <div className="listing-head">
                  <span className="category">{item.category}</span>
                  <span className="time-info">◔ {item.time}</span>
                </div>

                <h3>{item.title}</h3>

                <div className="location-row">
                  <span className="location-icon">◌</span>
                  <span>{item.location}</span>
                </div>

                <div className="listing-footer">
                  <strong>{item.price}</strong>
                  <span className="mini-location">
                    <span className="location-icon">◌</span>
                    {item.location}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
