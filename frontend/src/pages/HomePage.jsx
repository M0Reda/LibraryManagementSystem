import { Link } from 'react-router-dom'
import './HomePage.css'

const navCards = [
  {
    icon: '📖',
    label: 'Books',
    desc: 'Browse the full catalogue, search by title or author, and see availability.',
    to: '/books',
    color: '#2C3E50',
  },
  {
    icon: '✍️',
    label: 'Authors',
    desc: 'Explore author profiles, biographies, and their published works.',
    to: '/authors',
    color: '#34495E',
  },
  {
    icon: '👥',
    label: 'Members',
    desc: 'Manage library member accounts, roles, and contact details.',
    to: '/members',
    color: '#1A6B5A',
    adminOnly: true,
  },
  {
    icon: '🔄',
    label: 'Borrowings',
    desc: 'Track active loans, due dates, and process book returns.',
    to: '/borrowings',
    color: '#7D3C98',
  },
]

export default function HomePage() {
  const userRole = localStorage.getItem('userRole') || 'Member'
  const userName = localStorage.getItem('userEmail')?.split('@')[0] || 'Reader'

  const visibleCards = navCards.filter((c) => !c.adminOnly || userRole === 'Admin')

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-badge">Welcome back, {userName} 👋</div>
          <h1 className="home-hero-title">
            Your Library,<br />
            <span className="home-hero-accent">All in One Place</span>
          </h1>
          <p className="home-hero-desc">
            Manage books, authors, members, and borrowings from a single,
            beautiful dashboard. Everything your library needs — organized and
            always at your fingertips.
          </p>
          <div className="home-hero-actions">
            <Link to="/books" id="hero-browse-books" className="btn btn-primary btn-lg">
              📖 Browse Books
            </Link>
            <Link to="/borrowings" id="hero-view-borrowings" className="btn btn-ghost btn-lg">
              🔄 View Borrowings
            </Link>
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <div className="book-stack">
            <div className="book b1">Philosophy</div>
            <div className="book b2">Science</div>
            <div className="book b3">History</div>
            <div className="book b4">Fiction</div>
          </div>
        </div>
      </section>

      <section className="home-cards-section">
        <h2 className="section-title">Quick Access</h2>
        <div className="home-nav-grid">
          {visibleCards.map((card) => (
            <Link to={card.to} key={card.label} className="home-nav-card" id={`home-nav-${card.label.toLowerCase()}`}>
              <div className="home-nav-card-icon" style={{ background: card.color }}>
                {card.icon}
              </div>
              <div className="home-nav-card-content">
                <h3>{card.label}</h3>
                <p>{card.desc}</p>
              </div>
              <span className="home-nav-card-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <p>📚 LibraryMS &mdash; Built with React &amp; ASP.NET Core</p>
      </footer>
    </div>
  )
}
