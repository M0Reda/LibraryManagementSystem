import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBook, getAuthors, updateBook, deleteBook } from '../services/api'

export default function BookDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const role       = localStorage.getItem('userRole') || 'Member'
  const isAdmin    = role === 'Admin'

  const [book, setBook]       = useState(null)
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Edit form
  const [editing, setEditing]     = useState(false)
  const [form, setForm]           = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  // Delete confirm
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const fetchBook = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [bookRes, authorsRes] = await Promise.all([getBook(id), getAuthors()])
      setBook(bookRes.data)
      setAuthors(authorsRes.data)
      setForm({
        title: bookRes.data.title,
        isbn: bookRes.data.isbn,
        publishedYear: String(bookRes.data.publishedYear),
        authorId: '',
      })
    } catch {
      setError('Failed to load book details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchBook() }, [fetchBook])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await updateBook(id, {
        title: form.title,
        isbn: form.isbn,
        publishedYear: parseInt(form.publishedYear, 10),
        authorId: parseInt(form.authorId, 10),
      })
      setEditing(false)
      fetchBook()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save.'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBook(id)
      navigate('/books')
    } catch {
      alert('Failed to delete book.')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="page-wrapper">
      <div className="spinner-container"><div className="spinner" /></div>
    </div>
  )

  if (error) return (
    <div className="page-wrapper">
      <div className="alert alert-error">⚠️ {error}</div>
      <Link to="/books" className="btn btn-ghost" style={{ marginTop: 16 }}>← Back to Books</Link>
    </div>
  )

  return (
    <div className="page-wrapper" style={{ maxWidth: 720 }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 20, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        <Link to="/books" style={{ color: 'var(--color-accent)' }}>Books</Link>
        {' / '}
        <span>{book?.title}</span>
      </nav>

      <div className="card">
        <div style={{ height: 8, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
        <div className="card-body">
          {!editing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: '1.7rem', marginBottom: 6 }}>{book.title}</h1>
                  <p style={{ color: 'var(--color-accent)', fontWeight: 500, fontSize: '1rem' }}>
                    by {book.authorName || '—'}
                  </p>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button id="edit-book-inline-btn" className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Edit</button>
                    <button id="delete-book-detail-btn" className="btn btn-danger" onClick={() => setConfirmDel(true)}>🗑 Delete</button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { label: 'ISBN',            value: book.isbn || '—' },
                  { label: 'Published Year',  value: book.publishedYear || '—' },
                  { label: 'Author',          value: book.authorName || '—' },
                  { label: 'Book ID',         value: `#${book.id}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '14px 16px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSave}>
              <h2 style={{ marginBottom: 20 }}>✏️ Edit Book</h2>
              {formError && <div className="alert alert-error">⚠️ {formError}</div>}

              <div className="form-group">
                <label htmlFor="detail-title" className="form-label">Title</label>
                <input id="detail-title" className="form-control" value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="detail-isbn" className="form-label">ISBN</label>
                <input id="detail-isbn" className="form-control" value={form.isbn}
                  onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="detail-year" className="form-label">Published Year</label>
                <input id="detail-year" type="number" className="form-control" value={form.publishedYear}
                  onChange={(e) => setForm((p) => ({ ...p, publishedYear: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="detail-author" className="form-label">Author</label>
                <select id="detail-author" className="form-control" value={form.authorId}
                  onChange={(e) => setForm((p) => ({ ...p, authorId: e.target.value }))} required>
                  <option value="">— Select author —</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button id="save-book-detail-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDel && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDel(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🗑 Confirm Delete</span>
              <button className="modal-close" onClick={() => setConfirmDel(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-dialog">
                <p>Delete <strong>{book.title}</strong>? This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDel(false)}>Cancel</button>
              <button id="confirm-delete-detail-btn" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
