import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, User, Lock, Shield } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function UserManager({ onBack }) {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Form State
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newPin, setNewPin] = useState('')
    const [newRole, setNewRole] = useState('TEACHER') // TEACHER | ASSISTANT_TEACHER | ADMIN
    const [newUsername, setNewUsername] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('app_users').select('*').order('created_at')
            if (error) throw error
            setUsers(data)
        } catch (e) { setError(e.message) } finally { setLoading(false) }
    }

    const handleAddUser = async (e) => {
        e.preventDefault()
        if (!newName || !newPin || !newUsername) return
        if (newPin.length < 4) { alert('PIN must be at least 4 digits'); return }

        try {
            const { error } = await supabase.from('app_users').insert([{
                full_name: newName,
                username: newUsername,
                pin: newPin,
                role: newRole
            }])

            if (error) throw error

            setShowAdd(false)
            setNewName('')
            setNewPin('')
            setNewUsername('')
            fetchUsers()
        } catch (e) { alert(e.message) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            // Prevent deleting self?
            if (id === user.id) { alert("You cannot delete yourself!"); return }

            const { error } = await supabase.from('app_users').delete().eq('id', id)
            if (error) throw error
            fetchUsers()
        } catch (e) { alert(e.message) }
    }

    // Permission Check
    const canManage = user?.role === 'ADMIN' || user?.role === 'USHER_ADMIN'

    if (!canManage) {
        return (
            <div className="page slide-in">
                <header className="page-header"><button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button></header>
                <div className="empty-state">
                    <Shield size={48} color="#DC2626" />
                    <h3>Access Denied</h3>
                    <p>Only Admins can manage users.</p>
                </div>
            </div>
        )
    }

    // Filter Users based on Role
    const visibleUsers = users.filter(u => {
        if (user.role === 'ADMIN') return true // Admin sees all
        if (user.role === 'USHER_ADMIN') return u.role === 'USHER' || u.id === user.id // Usher Admin sees Ushers (and self)
        return false
    })

    // Role Options
    const getRoleOptions = () => {
        if (user.role === 'USHER_ADMIN') {
            return <option value="USHER">Usher (Service Attendance)</option>
        }
        return (
            <>
                <option value="TEACHER">Teacher (Kids)</option>
                <option value="ASSISTANT_TEACHER">Assistant (Kids)</option>
                <option value="ADMIN">Kids Admin (Full Access)</option>
                <option value="USHER_ADMIN">Usher Admin (Manage Ushers)</option>
            </>
        )
    }

    return (
        <div className="page slide-in">
            <header className="page-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                    <h2>Manage Users</h2>
                </div>
                {!showAdd && (
                    <button onClick={() => setShowAdd(true)} className="btn" style={{ padding: '8px 12px', fontSize: '14px' }}>
                        <Plus size={18} style={{ marginRight: '4px' }} /> Add User
                    </button>
                )}
            </header>

            {showAdd && (
                <div className="card" style={{ padding: '20px', marginBottom: '24px', border: '2px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '16px' }}>Add New Staff</h3>
                    <form onSubmit={handleAddUser}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" className="input" placeholder="e.g. John Doe" value={newName} onChange={e => setNewName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Username (Unique ID)</label>
                            <input type="text" className="input" placeholder="e.g. john" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>PIN Code</label>
                            <input type="tel" className="input" placeholder="e.g. 1234" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={6} required />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select className="input" value={newRole} onChange={e => setNewRole(e.target.value)}>
                                {getRoleOptions()}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button type="button" className="btn secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
                            <button type="submit" className="btn" style={{ flex: 1 }}>Create User</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="student-list">
                {loading ? <div className="empty-state">Loading...</div> : visibleUsers.map(u => (
                    <div key={u.id} className="card student-card" style={{ cursor: 'default' }}>
                        <div className="student-info">
                            <h3>{u.full_name} <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>({u.username})</span></h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={`badge ${u.role === 'ADMIN' ? 'visit-3' : (u.role === 'USHER_ADMIN' ? 'visit-3' : 'visit-1')}`} style={{ fontSize: '10px' }}>{u.role}</span>
                                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>PIN: {u.pin}</span>
                            </div>
                        </div>
                        {u.username !== 'admin' && u.id !== user.id && (
                            <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}>
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
