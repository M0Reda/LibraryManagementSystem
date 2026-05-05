import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, register } from '../services/api'
import './LoginPage.css'

// Decode JWT payload (no library needed)
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let res
      if (mode === 'login') {
        res = await login({ email: form.email, password: form.password })
      } else {
        res = await register({ fullName: form.fullName, email: form.email, password: form.password })
      }

      const { token } = res.data
      const payload = parseJwt(token)

      // Extract standard claim names used by .NET
      const email =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        payload.email ||
        form.email
      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload.role ||
        'Member'

      localStorage.setItem('token', token)
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userRole', role)

      navigate('/books')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Something went wrong. Please try again.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Background pattern */}
      <div className="login-bg-pattern" aria-hidden="true" />

      <div className="login-card">
        {/* Header */}
        <div className="login-card-header">
          <div className="login-logo">📚</div>
          <h1 className="login-title">LibraryMS</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError('') }}
            type="button"
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg login-submit"
            disabled={loading}
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  )
}
