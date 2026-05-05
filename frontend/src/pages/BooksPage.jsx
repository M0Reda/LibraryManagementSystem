import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getBooks, getAuthors, createBook, updateBook, deleteBook } from '../services/api'
import './BooksPage.css'

const EMPTY_FORM = { title: '', isbn: '', publishedYear: '', authorId: '' }

export default function BooksPage() {
  const role = localStorage.getItem('userRole') || 'Member'
  const isAdmin = role === 'Admin'

  const [books, setBooks]     = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')

  // Modal state
  const [showModal, setShowModal]   = useState(false)
  const [editBook, setEditBook]     = useState(null) // null = add mode
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formError, setFormError]   = useState('')
  const [saving, setSaving]         = useState(false)

  // Confirm delete
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [booksRes, authorsRes] = await Promise.all([getBooks(), getAuthors()])
      setBooks(booksRes.data)
      setAuthors(authorsRes.data)
    } catch {
      setError('Failed to load books. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    setEditBook(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (book) => {
    setEditBook(book)
    setForm({
      title: book.title,
      isbn: book.isbn,
      publishedYear: String(book.publishedYear),
      authorId: '',  // we don't have authorId in response, user must re-select
    })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditBook(null) }

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setFormError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        title: form.title,
        isbn: form.isbn,
        publishedYear: parseInt(form.publishedYear, 10),
        authorId: parseInt(form.authorId, 10),
      }
      if (editBook) {
        await updateBook(editBook.id, payload)
      } else {
        await createBook(payload)
      }
      closeModal()
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to save book.'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBook(confirmId)
      setConfirmId(null)
      fetchData()
    } catch {
      alert('Failed to delete book.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.authorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn || '').includes(search)
  )

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">📖 Books</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="books-count">{books.length} books</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="books-search"
            type="text"
            className="form-control search-input"
            placeholder="Search by title, author, ISBN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-error">⚠️ {error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No books found</h3>
          <p>{search ? 'Try a different search term.' : 'No books have been added yet.'}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="books-grid">
          {filtered.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-card-spine" />
              <div className="book-card-body">
                <Link to={`/books/${book.id}`} className="book-card-title" id={`book-link-${book.id}`}>
                  {book.title}
                </Link>
                <div className="book-card-author">by {book.authorName || '—'}</div>
                <div className="book-card-meta">
                  <div className="book-card-meta-row">
                    <span>🔖</span> <span>ISBN: {book.isbn || '—'}</span>
                  </div>
                  <div className="book-card-meta-row">
                    <span>📅</span> <span>{book.publishedYear || '—'}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="book-card-actions">
                    <button
                      id={`edit-book-${book.id}`}
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(book)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      id={`delete-book-${book.id}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmId(book.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB — Add Book (Admin) */}
      {isAdmin && (
        <button id="add-book-fab" className="fab" onClick={openAdd} title="Add Book">
          +
        </button>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editBook ? '✏️ Edit Book' : '➕ Add New Book'}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">⚠️ {formError}</div>}

                <div className="form-group">
                  <label htmlFor="book-title" className="form-label">Title</label>
                  <input id="book-title" name="title" className="form-control" value={form.title}
                    onChange={handleFormChange} required placeholder="Book title" />
                </div>

                <div className="form-group">
                  <label htmlFor="book-isbn" className="form-label">ISBN</label>
                  <input id="book-isbn" name="isbn" className="form-control" value={form.isbn}
                    onChange={handleFormChange} required placeholder="978-3-16-148410-0" />
                </div>

                <div className="form-group">
                  <label htmlFor="book-year" className="form-label">Published Year</label>
                  <input id="book-year" name="publishedYear" type="number" min="1000" max={new Date().getFullYear()}
                    className="form-control" value={form.publishedYear}
                    onChange={handleFormChange} required placeholder="2023" />
                </div>

                <div className="form-group">
                  <label htmlFor="book-author" className="form-label">Author</label>
                  <select id="book-author" name="authorId" className="form-control" value={form.authorId}
                    onChange={handleFormChange} required>
                    <option value="">— Select author —</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button id="save-book-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🗑 Confirm Delete</span>
              <button className="modal-close" onClick={() => setConfirmId(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-dialog">
                <p>Are you sure you want to delete this book? This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button id="confirm-delete-book-btn" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
