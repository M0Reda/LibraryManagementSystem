import { useState, useEffect, useCallback } from 'react'
import {
  getBorrowings,
  getMemberBorrowings,
  getMembers,
  getBooks,
  createBorrowing,
  returnBorrowing,
} from '../services/api'

const today = () => new Date().toISOString().split('T')[0]

const fmt = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const isOverdue = (dueDate, returnDate) => {
  if (returnDate) return false
  return new Date(dueDate) < new Date()
}

function getLoggedInMemberId() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    const id =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      payload.sub ||
      payload.nameid ||
      null
    return id ? parseInt(id, 10) : null
  } catch {
    return null
  }
}

export default function BorrowingsPage() {
  const role     = localStorage.getItem('userRole') || 'Member'
  const isAdmin  = role === 'Admin'
  const memberId = getLoggedInMemberId()

  const [borrowings, setBorrowings] = useState([])
  const [members, setMembers]       = useState([])
  const [books, setBooks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filter, setFilter]         = useState('all')

  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ memberId: '', bookId: '', dueDate: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  const [returningId, setReturningId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (isAdmin) {
        const [bRes, mRes, bookRes] = await Promise.all([
          getBorrowings(),
          getMembers(),
          getBooks(),
        ])
        setBorrowings(bRes.data)
        setMembers(mRes.data)
        setBooks(bookRes.data)
      } else {
        const [bRes, bookRes] = await Promise.all([
          getMemberBorrowings(memberId),
          getBooks(),
        ])
        setBorrowings(bRes.data)
        setBooks(bookRes.data)
      }
    } catch {
      setError('Failed to load borrowings.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, memberId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await createBorrowing({
        memberId: isAdmin ? parseInt(form.memberId, 10) : memberId,
        bookId:   parseInt(form.bookId, 10),
        dueDate:  form.dueDate,
      })
      setShowForm(false)
      setForm({ memberId: '', bookId: '', dueDate: '' })
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create borrowing.'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async (id) => {
    setReturningId(id)
    try {
      await returnBorrowing(id)
      fetchData()
    } catch {
      alert('Failed to process return.')
    } finally {
      setReturningId(null)
    }
  }

  const filtered = borrowings.filter((b) => {
    if (filter === 'active')   return !b.returnDate
    if (filter === 'returned') return !!b.returnDate
    return true
  })

  const activeCount   = borrowings.filter((b) => !b.returnDate).length
  const returnedCount = borrowings.filter((b) => !!b.returnDate).length

  if (!memberId && !isAdmin) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">⚠️ Could not identify your account. Please log out and log in again.</div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔄 Borrowings</h1>
          {!isAdmin && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              Showing your borrowings only
            </p>
          )}
        </div>
        <button id="add-borrowing-btn" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Borrowing
        </button>
      </div>

      <div className="info-grid" style={{ marginBottom: 20 }}>
        <div className="info-card">
          <div className="info-card-icon">📋</div>
          <div>
            <div className="info-card-label">Total</div>
            <div className="info-card-value">{borrowings.length}</div>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">📤</div>
          <div>
            <div className="info-card-label">Active</div>
            <div className="info-card-value" style={{ color: 'var(--color-success)' }}>{activeCount}</div>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">✅</div>
          <div>
            <div className="info-card-label">Returned</div>
            <div className="info-card-value">{returnedCount}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'active', 'returned'].map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '📋 All' : f === 'active' ? '📤 Active' : '✅ Returned'}
          </button>
        ))}
      </div>

      {loading && <div className="spinner-container"><div className="spinner" /></div>}
      {!loading && error && <div className="alert alert-error">⚠️ {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔄</div>
          <h3>No borrowings found</h3>
          <p>No records match the current filter.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                {isAdmin && <th>Member</th>}
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const overdue = isOverdue(b.dueDate, b.returnDate)
                const canReturn = isAdmin || (b.memberId === memberId && !b.returnDate)

                return (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{i + 1}</td>
                    {isAdmin && (
                      <td style={{ fontWeight: 600 }}>{b.memberName || `#${b.memberId}`}</td>
                    )}
                    <td style={{ color: 'var(--color-accent)' }}>{b.bookTitle || `#${b.bookId}`}</td>
                    <td>{fmt(b.borrowDate) || '—'}</td>
                    <td style={{
                      color: overdue ? 'var(--color-danger)' : 'inherit',
                      fontWeight: overdue ? 600 : 400,
                    }}>
                      {fmt(b.dueDate) || '—'}
                      {overdue && (
                        <span style={{ marginLeft: 6, fontSize: '0.75rem' }}>⚠️ Overdue</span>
                      )}
                    </td>
                    <td>
                      {b.returnDate ? (
                        <span className="badge badge-returned">✅ {fmt(b.returnDate)}</span>
                      ) : (
                        <span className="badge badge-active">● Active</span>
                      )}
                    </td>
                    <td>
                      {canReturn && !b.returnDate && (
                        <button
                          id={`return-btn-${b.id}`}
                          className="btn btn-success btn-sm"
                          onClick={() => handleReturn(b.id)}
                          disabled={returningId === b.id}
                        >
                          {returningId === b.id ? '…' : '↩ Return'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">➕ New Borrowing</span>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">⚠️ {formError}</div>}

                {isAdmin ? (
                  <div className="form-group">
                    <label htmlFor="borrow-member" className="form-label">Member</label>
                    <select
                      id="borrow-member"
                      className="form-control"
                      value={form.memberId}
                      onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))}
                      required
                    >
                      <option value="">— Select member —</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    📌 This borrowing will be registered under your account.
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="borrow-book" className="form-label">Book</label>
                  <select
                    id="borrow-book"
                    className="form-control"
                    value={form.bookId}
                    onChange={(e) => setForm((p) => ({ ...p, bookId: e.target.value }))}
                    required
                  >
                    <option value="">— Select book —</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="borrow-duedate" className="form-label">Due Date</label>
                  <input
                    id="borrow-duedate"
                    type="date"
                    className="form-control"
                    value={form.dueDate}
                    min={today()}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button id="save-borrowing-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Create Borrowing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
