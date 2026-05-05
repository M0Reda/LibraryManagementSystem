import { useState, useEffect, useCallback } from 'react'
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '../services/api'

const EMPTY_FORM = { name: '', email: '', bio: '' }

export default function AuthorsPage() {
  const role    = localStorage.getItem('userRole') || 'Member'
  const isAdmin = role === 'Admin'

  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editAuthor, setEditAuthor] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]     = useState(false)

  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const fetchAuthors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAuthors()
      setAuthors(res.data)
    } catch {
      setError('Failed to load authors.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAuthors() }, [fetchAuthors])

  const openAdd = () => {
    setEditAuthor(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (author) => {
    setEditAuthor(author)
    setForm({ name: author.name, email: author.email, bio: author.bio || '' })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditAuthor(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editAuthor) {
        await updateAuthor(editAuthor.id, form)
      } else {
        await createAuthor(form)
      }
      closeModal()
      fetchAuthors()
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
      await deleteAuthor(confirmId)
      setConfirmId(null)
      fetchAuthors()
    } catch {
      alert('Failed to delete author.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">✍️ Authors</h1>
        {isAdmin && (
          <button id="add-author-btn" className="btn btn-primary" onClick={openAdd}>
            + Add Author
          </button>
        )}
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="authors-search"
            type="text"
            className="form-control search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="spinner-container"><div className="spinner" /></div>}
      {!loading && error && <div className="alert alert-error">⚠️ {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✍️</div>
          <h3>No authors found</h3>
          <p>{search ? 'Try a different search.' : 'No authors added yet.'}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Bio</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((author, i) => (
                <tr key={author.id}>
                  <td style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{author.name}</td>
                  <td style={{ color: 'var(--color-accent)' }}>{author.email || '—'}</td>
                  <td style={{ maxWidth: 280, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {author.bio ? (author.bio.length > 80 ? author.bio.slice(0, 80) + '…' : author.bio) : '—'}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="table-actions">
                        <button
                          id={`edit-author-${author.id}`}
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(author)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          id={`delete-author-${author.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmId(author.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editAuthor ? '✏️ Edit Author' : '➕ Add Author'}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">⚠️ {formError}</div>}

                <div className="form-group">
                  <label htmlFor="author-name" className="form-label">Name</label>
                  <input id="author-name" className="form-control" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Author name" />
                </div>
                <div className="form-group">
                  <label htmlFor="author-email" className="form-label">Email</label>
                  <input id="author-email" type="email" className="form-control" value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="author@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="author-bio" className="form-label">Bio</label>
                  <textarea id="author-bio" className="form-control" value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Short biography…" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="save-author-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🗑 Confirm Delete</span>
              <button className="modal-close" onClick={() => setConfirmId(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-dialog">
                <p>Delete this author? This cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button id="confirm-delete-author-btn" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
