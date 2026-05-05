import { Link, NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const email = localStorage.getItem('userEmail') || ''
  const fullName = localStorage.getItem('userFullName') || ''
  const role  = localStorage.getItem('userRole')  || ''
  
  const displayName = fullName || email.split('@')[0]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userFullName')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          📚 <span>LibraryMS</span>
        </Link>

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

        <div className="navbar-right">
          {displayName && (
            <span className="navbar-user" title={displayName}>
              👤 {displayName}
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
