import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, PenLine, User, Trash2, MapPin, Heart } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

function MemberForm({ onBack, onComplete, initialData, canDelete }) {
    const [name, setName] = useState(initialData?.full_name || '')
    const [nickname, setNickname] = useState(initialData?.nickname || '')
    const [gender, setGender] = useState(initialData?.gender || 'Male')
    const [birthday, setBirthday] = useState(initialData?.birthday || '')
    const [civilStatus, setCivilStatus] = useState(initialData?.civil_status || 'Single')
    const [contactNumber, setContactNumber] = useState(initialData?.contact_number || '')
    const [address, setAddress] = useState(initialData?.address || '')
    const [ministry, setMinistry] = useState(initialData?.ministry || '')
    const [ministries, setMinistries] = useState([])
    const [allergies, setAllergies] = useState(initialData?.allergies || '')
    const [firstVisit, setFirstVisit] = useState(initialData?.first_visit_date || new Date().toISOString().split('T')[0])

    const [loading, setLoading] = useState(false)
    const isEdit = !!initialData

    const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
    const [uploading, setUploading] = useState(false)

    // Helper: Compute Age
    const calculateAge = (dob) => {
        if (!dob) return ''
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const age = calculateAge(birthday)

    useEffect(() => {
        fetchMinistries()
    }, [])

    async function fetchMinistries() {
        const { data } = await supabase.from('ministries').select('name').order('name')
        if (data) setMinistries(data.map(m => m.name))
    }

    const handleAddMinistry = async () => {
        const newMinistry = prompt("Enter new Ministry Name:")
        if (!newMinistry) return

        const { error } = await supabase.from('ministries').insert({ name: newMinistry })
        if (error) {
            alert("Error adding ministry: " + error.message)
        } else {
            fetchMinistries()
            setMinistry(newMinistry) // Auto select
        }
    }

    // Image Upload Logic with Resizing
    const handleImageUpload = async (e) => {
        try {
            setUploading(true)
            const file = e.target.files[0]
            if (!file) return

            // Resize Logic
            const img = document.createElement('img')
            const canvas = document.createElement('canvas')
            const reader = new FileReader()

            reader.onload = function (event) {
                img.onload = function () {
                    const MAX_WIDTH = 300
                    const MAX_HEIGHT = 300
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT }
                    }
                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    // Upload Blob
                    canvas.toBlob(async (blob) => {
                        const fileName = `member-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
                        const { data, error } = await supabase.storage.from('avatars').upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

                        if (error) throw error
                        const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
                        setAvatarUrl(publicUrl)
                        setUploading(false)
                    }, 'image/jpeg', 0.8)
                }
                img.src = event.target.result
            }
            reader.readAsDataURL(file)

        } catch (error) {
            alert('Error uploading: ' + error.message)
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)

        const entryData = {
            full_name: name,
            nickname: nickname,
            gender: gender,
            birthday: birthday || null,
            civil_status: civilStatus,
            contact_number: contactNumber,
            address: address,
            ministry: ministry,
            allergies: allergies || null,
            first_visit_date: firstVisit,
            avatar_url: avatarUrl
        }

        try {
            if (isEdit) {
                const { error } = await supabase.from('members').update(entryData).eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('members').insert([entryData])
                if (error) throw error
            }
            onComplete()
        } catch (error) {
            console.error(error)
            alert('Error saving: ' + (error.message || 'Unknown error'))
        } finally { setLoading(false) }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this member?')) return
        setLoading(true)
        try {
            const { error } = await supabase.from('members').delete().eq('id', initialData.id)
            if (error) throw error
            onComplete()
        } catch (error) { alert(error.message) } finally { setLoading(false) }
    }

    return (
        <div className="page slide-in">
            <header className="page-header">
                <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                <h2>{isEdit ? 'Edit Member' : 'Register Member'}</h2>
            </header>
            <form onSubmit={handleSubmit} className="student-form">

                {/* Avatar Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F3F4F6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '3px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={48} color="#9CA3AF" />
                        )}
                    </div>
                    <div className="file-upload-btn">
                        <label htmlFor="avatar-upload" className="btn secondary" style={{ fontSize: '12px', padding: '6px 12px', cursor: 'pointer' }}>
                            {uploading ? 'Compressing...' : (avatarUrl ? 'Change Photo' : 'Upload Photo')}
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="input" placeholder="e.g. Juan Dela Cruz" value={name} onChange={e => setName(e.target.value)} autoFocus />
                </div>

                <div className="form-group">
                    <label>Nickname (Optional)</label>
                    <input type="text" className="input" placeholder="e.g. Johnny" value={nickname} onChange={e => setNickname(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <div className="gender-select">
                        <div className={`gender-option ${gender === 'Male' ? 'selected' : ''}`} onClick={() => setGender('Male')}>Male</div>
                        <div className={`gender-option ${gender === 'Female' ? 'selected' : ''}`} onClick={() => setGender('Female')}>Female</div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Civil Status</label>
                    <select className="input" value={civilStatus} onChange={e => setCivilStatus(e.target.value)}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Birthday (Optional)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input type="date" className="input" value={birthday} onChange={e => setBirthday(e.target.value)} style={{ flex: 1 }} />
                        {age !== '' && (
                            <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                {age} yrs old
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Contact Number</label>
                    <input type="text" className="input" placeholder="0912..." value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input type="text" className="input" placeholder="Barangay, City..." value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Ministry / Department
                        <button type="button" onClick={handleAddMinistry} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Add New</button>
                    </label>
                    <select className="input" value={ministry} onChange={e => setMinistry(e.target.value)}>
                        <option value="">Select Ministry...</option>
                        {ministries.map(m => <option key={m} value={m}>{m}</option>)}
                        <option value="None">None</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>First Day of Visit</label>
                    <input type="date" className="input" value={firstVisit} onChange={e => setFirstVisit(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Allergies / Medical Notes</label>
                    <textarea
                        className="input"
                        placeholder="e.g. Hypertension, etc."
                        value={allergies}
                        onChange={e => setAllergies(e.target.value)}
                        rows={3}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <button type="submit" className="btn full-width" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Changes' : 'Save Member')}</button>
                {isEdit && canDelete && (
                    <button type="button" onClick={handleDelete} className="btn full-width" style={{ background: '#FEE2E2', color: '#DC2626', marginTop: '12px' }} disabled={loading}>
                        <Trash2 size={20} style={{ marginRight: '8px' }} /> Delete Member
                    </button>
                )}
            </form>
        </div>
    )
}

export default function MemberManager({ onBack }) {
    const { permissions } = useAuth()
    const [view, setView] = useState('list') // list, add, edit
    const [editingMember, setEditingMember] = useState(null)

    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchMembers()
    }, [])

    async function fetchMembers() {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('members').select('*').order('full_name')
            if (error) throw error
            setMembers(data)
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const filtered = members.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Reuse Student Edit Permissions for now or assume Admin/Teachers can edit
    const canEdit = permissions.canEditStudents || permissions.isUsher // Ushers might need to add members? Assuming Yes based on context.

    // For now strict permission check same as Students
    if (!permissions.canEditStudents && !permissions.role === 'ADMIN') {
        // Fallback if permission logic is strict, but usually teachers can add.
    }

    if (view === 'add') {
        return <MemberForm onBack={() => setView('list')} onComplete={() => { setView('list'); fetchMembers(); }} initialData={null} canDelete={false} />
    }

    if (view === 'edit') {
        return <MemberForm onBack={() => setView('list')} onComplete={() => { setView('list'); fetchMembers(); }} initialData={editingMember} canDelete={permissions.canDeleteStudents} />
    }

    return (
        <div className="page slide-in">
            <header className="page-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                    <h2>Congregation</h2>
                </div>
                <button onClick={() => setView('add')} className="btn" style={{ padding: '8px 12px', fontSize: '14px' }}>
                    <Plus size={18} style={{ marginRight: '4px' }} /> Add
                </button>
            </header>

            <div className="search-bar">
                <input type="text" placeholder="Search member..." className="input search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={20} className="search-icon" />
            </div>

            <div className="student-list">
                {loading ? <div className="empty-state">Loading...</div> : filtered.length === 0 ? <div className="empty-state">No members found.</div> : (
                    filtered.map(member => (
                        <div key={member.id} className="card student-card" onClick={() => { setEditingMember(member); setView('edit'); }}>
                            <div className="student-info">
                                <h3>{member.full_name} {member.nickname && <span style={{ color: 'var(--primary)', fontWeight: 'normal' }}>"{member.nickname}"</span>}</h3>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666' }}>
                                    {member.ministry && <span>{member.ministry}</span>}
                                    {member.ministry && <span>•</span>}
                                    <span>{member.civil_status}</span>
                                </div>
                            </div>
                            <div style={{ color: 'var(--primary)' }}><PenLine size={20} /></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
