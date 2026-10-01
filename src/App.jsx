import './App.css'

const categories = ['All', 'Motors', 'Property', 'Jobs', 'Classifieds', 'Community']

const cards = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    badge: 'Featured',
    category: 'Motors',
    time: 'Today',
    title: '2023 Tesla Model Y Performance - GCC Specs',
    location: 'Dubai Marina',
    price: 'AED210,000',
    info: ['2023', '15,000 km', 'Dubai Marina'],
    accent: 'featured',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    badge: 'Premium',
    category: 'Property',
    time: 'Today',
    title: 'Luxury 2BR Apartment with Sea View',
    location: 'Palm Jumeirah',
    price: 'AED/yr185,000',
    info: ['Palm Jumeirah'],
    accent: 'premium',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
    category: 'Electronics',
    time: 'Today',
    title: 'Rolex Submariner Date - 2024 Unworn',
    location: 'DIFC, Dubai',
    price: 'AED45,000',
    info: ['DIFC, Dubai'],
    accent: 'hot',
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    badge: 'New',
    category: 'Electronics',
    time: '4 hours ago',
    title: 'Gaming PC RTX 4090 Full Setup',
    location: 'Downtown',
    price: 'AED12,500',
    info: ['Downtown'],
    accent: 'new',
  },
]

const projects = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    badge: 'Off Plan',
    category: 'Property',
    time: 'Just now',
    title: 'Palm Jebel Ali Villas - Phase 1',
    location: 'Palm Jebel Ali',
    price: 'AED18,000,000',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80',
    badge: 'New Launch',
    category: 'Property',
    time: 'Today',
    title: 'Emaar Beachfront - Seapoint',
    location: 'Dubai Harbour',
    price: 'AED7,400,000',
  },
]

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand" aria-label="DubaiZA logo">
          <span className="brand-mark">D</span>
          <span className="brand-text">DubaiZA</span>
        </div>

        <div className="header-actions">
          <button className="theme-button" type="button" aria-label="Change theme">
            <span className="theme-swatch" aria-hidden="true" />
            Change Theme
          </button>

          <button className="menu-button" type="button" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className="content">
        <section className="hero-panel" aria-label="Marketplace search">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-overlay" aria-hidden="true" />

          <div className="hero-content">
            <h1>The Marketplace for Everything</h1>
            <p>Buy, sell, and find anything from cars and homes to jobs and services.</p>

            <div className="category-pills" aria-label="Categories">
              {categories.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`category-pill ${index === 0 ? 'active' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="search-bar" role="search">
              <div className="search-field search-primary">
                <span className="search-icon">⌕</span>
                <input type="text" placeholder="Search for anything..." aria-label="Search" />
              </div>

              <div className="search-field search-location">
                <span className="location-icon">◌</span>
                <span>All Cities</span>
                <span className="caret">▾</span>
              </div>

              <button type="button" className="search-button">
                Search
              </button>
            </div>

            <div className="ai-box">
              <div className="ai-copy">
                <span className="ai-badge">AI</span>
                <span>Not sure what you want? Let AI help.</span>
              </div>
              <button type="button">Ask AI Assistant →</button>
            </div>
          </div>
        </section>

        <section className="listing-section" aria-label="Trending listings">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-icon">☰</span>
              <h2>Trending Today</h2>
            </div>
            <a href="#">View All</a>
          </div>

          <div className="cards-grid">
            {cards.map((item) => (
              <article className="listing-card" key={item.id}>
                <div
                  className="listing-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <span className={`badge ${item.accent}`}>{item.badge}</span>
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

                  <div className="meta-row">
                    {item.info.map((meta, index) => (
                      <div key={`${item.id}-${meta}`} className="meta-item">
                        {index > 0 ? <span className="meta-divider" /> : null}
                        <span className="location-icon">◌</span>
                        <span>{meta}</span>
                      </div>
                    ))}
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
          </div>
        </section>

        <section className="listing-section" aria-label="New project listings">
          <div className="section-header project-header">
            <div className="section-title-wrap">
              <span className="section-icon">✦</span>
              <h2>New Projects Launching</h2>
            </div>
            <button type="button" className="view-all-projects">View All Projects</button>
          </div>

          <div className="cards-grid compact-grid">
            {projects.map((item) => (
              <article className="listing-card compact-card" key={item.id}>
                <div
                  className="listing-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <span className="badge project-badge">{item.badge}</span>
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

                  <div className="location-row compact-location">
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
          </div>
        </section>

        <section className="job-banner" aria-label="Job seekers">
          <div className="job-icon">◍</div>
          <div className="job-copy">
            <p className="job-label">Job Seekers</p>
            <h3>Find your dream job</h3>
            <p>Browse thousands of job vacancies from top companies in the UAE.</p>
          </div>
          <button type="button" className="job-button">Explore Jobs</button>
        </section>
      </main>
    </div>
  )
}

export default App
