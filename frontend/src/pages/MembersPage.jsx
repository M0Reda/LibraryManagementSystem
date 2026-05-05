import { useState, useEffect, useCallback } from 'react'
import { getMembers, updateMember, deleteMember } from '../services/api'

export default function MembersPage() {
  const role    = localStorage.getItem('userRole') || 'Member'
  const isAdmin = role === 'Admin'

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')

  const [editMember, setEditMember] = useState(null)
  const [form, setForm]             = useState({})
  const [formError, setFormError]   = useState('')
  const [saving, setSaving]         = useState(false)

  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMembers()
      setMembers(res.data)
    } catch {
      setError('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const openEdit = (member) => {
    setEditMember(member)
    setForm({
      fullName: member.fullName || '',
      email: member.email || '',
      phone: member.profile?.phone || '',
    })
    setFormError('')
  }

  const closeEdit = () => { setEditMember(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await updateMember(editMember.id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      })
      closeEdit()
      fetchMembers()
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
      await deleteMember(confirmId)
      setConfirmId(null)
      fetchMembers()
    } catch {
      alert('Failed to delete member.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = members.filter(
    (m) =>
      (m.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!isAdmin) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">⛔ Access denied. Admins only.</div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">👥 Members</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {members.length} registered
        </span>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="members-search"
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
          <div className="empty-state-icon">👥</div>
          <h3>No members found</h3>
          <p>{search ? 'Try a different search.' : 'No members yet.'}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, i) => (
                <tr key={member.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{member.fullName}</td>
                  <td style={{ color: 'var(--color-accent)' }}>{member.email}</td>
                  <td>
                    <span className={`badge ${member.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{member.profile?.phone || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        id={`edit-member-${member.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(member)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        id={`delete-member-${member.id}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmId(member.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editMember && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Member</span>
              <button className="modal-close" onClick={closeEdit}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">⚠️ {formError}</div>}
                <div className="form-group">
                  <label htmlFor="member-fullname" className="form-label">Full Name</label>
                  <input id="member-fullname" className="form-control" value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label htmlFor="member-email" className="form-label">Email</label>
                  <input id="member-email" type="email" className="form-control" value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label htmlFor="member-phone" className="form-label">Phone</label>
                  <input id="member-phone" className="form-control" value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeEdit}>Cancel</button>
                <button id="save-member-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🗑 Confirm Delete</span>
              <button className="modal-close" onClick={() => setConfirmId(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="confirm-dialog">
                <p>Remove this member? This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button id="confirm-delete-member-btn" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
