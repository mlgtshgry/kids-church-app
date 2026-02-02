import { useState, useEffect } from 'react'

import {
    ArrowLeft, Plus, Trash2, User, Lock, Shield,
    History, // Icon for Login History
    KeyRound // Icon for PIN Reset
} from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function UserManager({ onBack, initialTab = 'KIDS', lockedTab = null }) {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)



    // Tab State
    const [activeTab, setActiveTab] = useState(lockedTab || initialTab) // 'KIDS' | 'USHERS'

    // Form State
    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newPin, setNewPin] = useState('')
    const [newRole, setNewRole] = useState((lockedTab || initialTab) === 'USHERS' ? 'USHER' : 'TEACHER')
    const [newUsername, setNewUsername] = useState('')

    useEffect(() => {
        // Reset role default when tab changes
        if (activeTab === 'USHERS') setNewRole('USHER')
        else setNewRole('TEACHER')
    }, [activeTab])

    // Force update tab if props change (fix for component reuse)
    useEffect(() => {
        if (lockedTab) setActiveTab(lockedTab)
        else setActiveTab(initialTab)
    }, [initialTab, lockedTab])

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
    const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'USHER_ADMIN'

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

    // Filter Users based on Role & Tab
    const visibleUsers = users.filter(u => {
        // First, filter based on active Tab
        let matchesTab = false
        if (activeTab === 'KIDS') {
            matchesTab = ['ADMIN', 'TEACHER', 'ASSISTANT_TEACHER', 'SUPER_ADMIN'].includes(u.role)
        } else if (activeTab === 'USHERS') {
            matchesTab = ['USHER_ADMIN', 'USHER', 'SUPER_ADMIN'].includes(u.role)
        }

        // Then apply Permission Filters
        if (user.role === 'SUPER_ADMIN') return matchesTab // Super Admin sees whatever is in the tab
        if (user.role === 'ADMIN') return matchesTab && u.role !== 'SUPER_ADMIN' // Kids Admin sees Kids tab
        if (user.role === 'USHER_ADMIN') return matchesTab && (u.role === 'USHER' || u.id === user.id) // Usher Admin sees Ushers

        return false
    })

    // Reset PIN Logic
    const handleResetPin = async (userId) => {
        const newPin = prompt("Enter new 4-6 digit PIN for this user:")
        if (!newPin) return
        if (newPin.length < 4) { alert("PIN must be at least 4 digits"); return }

        try {
            const { error } = await supabase.from('app_users').update({ pin: newPin }).eq('id', userId)
            if (error) throw error
            alert("PIN updated successfully.")
            fetchUsers()
        } catch (e) { alert(e.message) }
    }

    // Role Options
    const getRoleOptions = () => {
        // PRIORITY: If lockedTab is USHERS, ALWAYS show Usher options
        if (lockedTab === 'USHERS' || activeTab === 'USHERS') {
            return (
                <>
                    <option value="USHER">Usher (Service Attendance)</option>
                    <option value="USHER_ADMIN">Usher Admin (Manage Ushers)</option>
                </>
            )
        }
        // Default to KIDS
        return (
            <>
                <option value="TEACHER">Teacher (Kids)</option>
                <option value="ASSISTANT_TEACHER">Assistant (Kids)</option>
                {/* Only Super Admin creates Admins */}
                {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && <option value="ADMIN">Admin (Kids Manager)</option>}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Link to Login History if Super Admin */}
                    {user.role === 'SUPER_ADMIN' && (
                        <button onClick={() => onNavigate('login-history')} className="btn secondary" style={{ padding: '8px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <History size={18} /> Login Logs
                        </button>
                    )}

                    {!showAdd && (
                        <button onClick={() => setShowAdd(true)} className="btn" style={{ padding: '8px 12px', fontSize: '14px' }}>
                            <Plus size={18} style={{ marginRight: '4px' }} /> Add User
                        </button>
                    )}
                </div>
            </header>

            {/* TABS - Only show if not locked */}
            {!lockedTab && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
                    <button
                        onClick={() => { setActiveTab('KIDS'); setNewRole('TEACHER'); }}
                        style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'KIDS' ? '2px solid var(--primary)' : 'none', fontWeight: activeTab === 'KIDS' ? 'bold' : 'normal', color: activeTab === 'KIDS' ? 'var(--primary)' : '#6B7280' }}
                    >
                        Kids Ministry
                    </button>
                    <button
                        onClick={() => { setActiveTab('USHERS'); setNewRole('USHER'); }}
                        style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'USHERS' ? '2px solid var(--primary)' : 'none', fontWeight: activeTab === 'USHERS' ? 'bold' : 'normal', color: activeTab === 'USHERS' ? 'var(--primary)' : '#6B7280' }}
                    >
                        Ushering Team
                    </button>
                </div>
            )}

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
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {/* Reset PIN Capability */}
                                {(user.role === 'SUPER_ADMIN' || (user.role === 'ADMIN' && u.role !== 'SUPER_ADMIN')) && (
                                    <button onClick={() => handleResetPin(u.id)} style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer' }} title="Reset PIN">
                                        <KeyRound size={20} />
                                    </button>
                                )}

                                <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
