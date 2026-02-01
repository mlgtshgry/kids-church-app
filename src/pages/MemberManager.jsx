import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, Trash2, Edit2, User, Phone, MapPin, Calendar, FileText, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

// --- MEMBER PROFILE COMPONENT ---
function MemberProfile({ member, onBack, onEdit }) {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, lastVisit: 'Never' })

    useEffect(() => {
        fetchHistory()
    }, [member])

    async function fetchHistory() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('member_attendance')
                .select('*')
                .eq('member_id', member.id)
                .order('date', { ascending: false })

            if (error) throw error
            setHistory(data)

            // Stats
            const total = data.filter(d => d.status === 'PRESENT').length
            const lastVisit = data.length > 0 ? new Date(data[0].date).toLocaleDateString() : 'Never'
            setStats({ total, lastVisit })

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page slide-in" style={{ padding: 0, background: '#F9FAFB' }}>
            {/* Header */}
            <div className="profile-header">
                <button onClick={onBack} className="back-btn" style={{ position: 'absolute', top: '20px', left: '20px' }}><ArrowLeft size={24} /></button>
                <button onClick={() => onEdit(member)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                    <Edit2 size={24} />
                </button>

                <div className="big-avatar">
                    {member.full_name[0]}
                </div>
                <h2 className="profile-name">{member.full_name}</h2>
                <div className="profile-meta">
                    <span className={`badge ${member.age_group === 'YOUTH' ? 'visit-2' : (member.age_group === 'SENIOR' ? 'visit-3' : 'visit-1')}`} style={{ marginTop: 0 }}>
                        {member.age_group}
                    </span>
                    {member.contact_number && <span>• {member.contact_number}</span>}
                </div>
                {member.address && <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>{member.address}</p>}
                {member.notes && <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', fontStyle: 'italic' }}>"{member.notes}"</p>}
            </div>

            {/* Stats */}
            <div className="stats-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-card">
                    <span className="stat-val">{stats.total}</span>
                    <span className="stat-label">Total Visits</span>
                </div>
                <div className="stat-card">
                    <span className="stat-val" style={{ color: '#059669' }}>{stats.lastVisit}</span>
                    <span className="stat-label">Last Visit</span>
                </div>
            </div>

            {/* History List */}
            <div style={{ padding: '0 20px 20px' }}>
                <h3 className="section-header" style={{ marginBottom: '16px' }}>Attendance History</h3>
                {loading ? <div className="empty-state">Loading...</div> : history.length === 0 ? <div className="empty-state">No attendance recorded.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.map((record) => (
                            <div key={record.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: record.status === 'PRESENT' ? '#ECFDF5' : '#FEF2F2', padding: '8px', borderRadius: '10px', color: record.status === 'PRESENT' ? '#059669' : '#DC2626' }}>
                                        {record.status === 'PRESENT' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#1F2937' }}>
                                            {new Date(record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                                            {record.service_type || 'Morning Service'}
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: record.status === 'PRESENT' ? '#059669' : '#DC2626' }}>
                                    {record.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- MAIN MANAGER COMPONENT ---
export default function MemberManager({ onBack }) {
    const { user } = useAuth()
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // View State
    const [view, setView] = useState('list') // 'list' | 'profile'
    const [selectedMember, setSelectedMember] = useState(null)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [editingMember, setEditingMember] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        contact_number: '',
        address: '',
        birthday: '',
        age_group: 'ADULT',
        notes: ''
    })

    useEffect(() => {
        fetchMembers()
    }, [])

    async function fetchMembers() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .order('full_name')

            if (error) throw error
            setMembers(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            if (editingMember) {
                // UPDATE
                const { error } = await supabase
                    .from('members')
                    .update(formData)
                    .eq('id', editingMember.id)
                if (error) throw error
            } else {
                // INSERT
                const { error } = await supabase
                    .from('members')
                    .insert([formData])
                if (error) throw error
            }

            closeModal()
            fetchMembers()
            // If editing in profile view, update selected member data
            if (view === 'profile' && editingMember) {
                setSelectedMember({ ...editingMember, ...formData })
            }
        } catch (e) {
            alert(e.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this member? This will delete all their attendance history!')) return
        try {
            const { error } = await supabase.from('members').delete().eq('id', id)
            if (error) throw error
            fetchMembers()
            if (view === 'profile') setView('list')
        } catch (e) {
            alert('Cannot delete: ' + e.message)
        }
    }

    const openAdd = () => {
        setEditingMember(null)
        setFormData({ full_name: '', contact_number: '', address: '', birthday: '', age_group: 'ADULT', notes: '' })
        setShowModal(true)
    }

    const openEdit = (member) => {
        setEditingMember(member)
        setFormData({
            full_name: member.full_name,
            contact_number: member.contact_number || '',
            address: member.address || '',
            birthday: member.birthday || '',
            age_group: member.age_group || 'ADULT',
            notes: member.notes || ''
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingMember(null)
    }

    // Role Check for Deletion (Only Usher Admin can delete)
    const canDelete = user?.role === 'USHER_ADMIN' || user?.role === 'ADMIN'

    const filteredMembers = members.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            {view === 'profile' && selectedMember ? (
                <MemberProfile
                    member={selectedMember}
                    onBack={() => { setView('list'); setSelectedMember(null); }}
                    onEdit={openEdit}
                />
            ) : (
                <div className="page slide-in">
                    <header className="page-header" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                            <h2>Members ({members.length})</h2>
                        </div>
                        <button onClick={openAdd} className="btn" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={24} />
                        </button>
                    </header>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="input"
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* List Layout */}
                    <div className="student-list">
                        {loading ? <p>Loading...</p> : filteredMembers.map(m => (
                            <div key={m.id} className="student-card" onClick={() => { setSelectedMember(m); setView('profile'); }}>
                                <div className="student-info">
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        {m.full_name}
                                        <span className={`badge ${m.age_group === 'YOUTH' ? 'visit-2' : (m.age_group === 'SENIOR' ? 'visit-3' : 'visit-1')}`} style={{ fontSize: '10px', marginTop: 0 }}>
                                            {m.age_group}
                                        </span>
                                    </h3>
                                </div>
                                <div style={{ color: '#D1D5DB' }}>
                                    <Edit2 size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                        <form onSubmit={handleSave} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input className="input" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Phone</label>
                                    <input className="input" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Age Group</label>
                                    <select className="input" value={formData.age_group} onChange={e => setFormData({ ...formData, age_group: e.target.value })}>
                                        <option value="ADULT">Adult</option>
                                        <option value="YOUTH">Youth</option>
                                        <option value="SENIOR">Senior</option>
                                        <option value="CHILD">Child (Visitor)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input className="input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Birthday</label>
                                <input type="date" className="input" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea className="input" rows="2" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                {editingMember && canDelete && (
                                    <button type="button" className="btn" onClick={() => { handleDelete(editingMember.id); closeModal() }} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none' }}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button type="button" className="btn secondary" onClick={closeModal} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 1 }}>{editingMember ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
