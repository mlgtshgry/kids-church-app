import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Search, PenLine, User, Trash2 } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

function StudentForm({ onBack, onComplete, initialData, canDelete }) {
    const [name, setName] = useState(initialData?.full_name || '')
    const [grade, setGrade] = useState(initialData?.grade_level || '')
    const [parentName, setParentName] = useState(initialData?.parent_name || '')
    const [contactNumber, setContactNumber] = useState(initialData?.contact_number || '')
    const [nickname, setNickname] = useState(initialData?.nickname || '')
    const [gender, setGender] = useState(initialData?.gender || 'Male')
    const [birthday, setBirthday] = useState(initialData?.birthday || '')
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
                        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
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
            grade_level: grade,
            parent_name: parentName,
            contact_number: contactNumber,
            gender: gender,
            nickname: nickname,
            birthday: birthday || null,
            allergies: allergies || null,
            first_visit_date: firstVisit,
            avatar_url: avatarUrl
        }

        try {
            if (isEdit) {
                const { error } = await supabase.from('students').update(entryData).eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('students').insert([entryData])
                if (error) throw error
            }
            onComplete()
        } catch (error) {
            console.error(error)
            alert('Error saving: ' + (error.message || 'Unknown error'))
        } finally { setLoading(false) }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this student?')) return
        setLoading(true)
        try {
            const { error } = await supabase.from('students').delete().eq('id', initialData.id)
            if (error) throw error
            onComplete()
        } catch (error) { alert(error.message) } finally { setLoading(false) }
    }

    return (
        <div className="page slide-in">
            <header className="page-header">
                <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                <h2>{isEdit ? 'Edit Student' : 'Register Student'}</h2>
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
                    <input type="text" className="input" placeholder="e.g. Timothy Santos" value={name} onChange={e => setName(e.target.value)} autoFocus />
                </div>

                <div className="form-group">
                    <label>Nickname (Optional)</label>
                    <input type="text" className="input" placeholder="e.g. Tim" value={nickname} onChange={e => setNickname(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <div className="gender-select">
                        <div className={`gender-option ${gender === 'Male' ? 'selected' : ''}`} onClick={() => setGender('Male')}>Male</div>
                        <div className={`gender-option ${gender === 'Female' ? 'selected' : ''}`} onClick={() => setGender('Female')}>Female</div>
                    </div>
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
                    <label>First Day of Visit</label>
                    <input type="date" className="input" value={firstVisit} onChange={e => setFirstVisit(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Allergies / Medical Notes</label>
                    <textarea
                        className="input"
                        placeholder="e.g. Peanuts, Asthma, etc."
                        value={allergies}
                        onChange={e => setAllergies(e.target.value)}
                        rows={3}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <div className="form-group">
                    <label>Grade Level</label>
                    <input type="text" className="input" placeholder="e.g. Grade 1" value={grade} onChange={e => setGrade(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Parent Name (Optional)</label>
                    <input type="text" className="input" placeholder="e.g. Mom/Dad Name" value={parentName} onChange={e => setParentName(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Contact No. (Optional)</label>
                    <input type="text" className="input" placeholder="0912..." value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                </div>

                <button type="submit" className="btn full-width" disabled={loading}>{loading ? 'Saving...' : (isEdit ? 'Update Changes' : 'Save Student')}</button>
                {isEdit && canDelete && (
                    <button type="button" onClick={handleDelete} className="btn full-width" style={{ background: '#FEE2E2', color: '#DC2626', marginTop: '12px' }} disabled={loading}>
                        <Trash2 size={20} style={{ marginRight: '8px' }} /> Delete Student
                    </button>
                )}
            </form>
        </div>
    )
}

export default function StudentManager({ onBack }) {
    const { permissions } = useAuth()
    const [view, setView] = useState('list') // list, add, edit
    const [editingStudent, setEditingStudent] = useState(null)

    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchStudents()
    }, [])

    async function fetchStudents() {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('students').select('*').order('full_name')
            if (error) throw error
            setStudents(data)
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const filtered = students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Check Permissions
    if (!permissions.canEditStudents) {
        return (
            <div className="page slide-in">
                <header className="page-header"><button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button></header>
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    <h3>Access Denied</h3>
                    <p>Client Access Only. Please see an Admin.</p>
                </div>
            </div>
        )
    }

    if (view === 'add') {
        return <StudentForm onBack={() => setView('list')} onComplete={() => { setView('list'); fetchStudents(); }} initialData={null} canDelete={false} />
    }

    if (view === 'edit') {
        return <StudentForm onBack={() => setView('list')} onComplete={() => { setView('list'); fetchStudents(); }} initialData={editingStudent} canDelete={permissions.canDeleteStudents} />
    }

    return (
        <div className="page slide-in">
            <header className="page-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                    <h2>Manage Students</h2>
                </div>
                <button onClick={() => setView('add')} className="btn" style={{ padding: '8px 12px', fontSize: '14px' }}>
                    <Plus size={18} style={{ marginRight: '4px' }} /> Add
                </button>
            </header>

            <div className="search-bar">
                <input type="text" placeholder="Search name..." className="input search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={20} className="search-icon" />
            </div>

            <div className="student-list">
                {loading ? <div className="empty-state">Loading...</div> : filtered.length === 0 ? <div className="empty-state">No students found.</div> : (
                    filtered.map(student => (
                        <div key={student.id} className="card student-card" onClick={() => { setEditingStudent(student); setView('edit'); }}>
                            <div className="student-info">
                                <h3>{student.full_name} {student.nickname && <span style={{ color: 'var(--primary)', fontWeight: 'normal' }}>"{student.nickname}"</span>}</h3>
                                <span>{student.grade_level || 'No Grade'}</span>
                            </div>
                            <div style={{ color: 'var(--primary)' }}><PenLine size={20} /></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
