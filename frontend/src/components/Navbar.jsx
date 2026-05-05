import { Link, NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const email = localStorage.getItem('userEmail') || ''
  const role  = localStorage.getItem('userRole')  || ''

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          📚 <span>LibraryMS</span>
        </Link>

        {/* Nav Links */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/books" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Books
            </NavLink>
          </li>
          <li>
            <NavLink to="/authors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Authors
            </NavLink>
          </li>
          {role === 'Admin' && (
            <li>
              <NavLink to="/members" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Members
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/borrowings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Borrowings
            </NavLink>
          </li>
        </ul>

        {/* Right side */}
        <div className="navbar-right">
          {email && (
            <span className="navbar-user" title={email}>
              👤 {email.split('@')[0]}
            </span>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
