import { useState, useEffect } from 'react'
import { ArrowLeft, Search, CheckCircle, BookOpen, MessageSquare, Lock, Unlock } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

function RemarkModal({ visible, onSave, onCancel, initialValue }) {
    const [val, setVal] = useState('')
    useEffect(() => { if (visible) setVal(initialValue || '') }, [visible, initialValue])
    if (!visible) return null
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '12px' }}>Add Note</h3>
                <textarea
                    className="input"
                    rows={3}
                    placeholder="e.g. Sick, Brought Friend..."
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    autoFocus
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button className="btn" style={{ flex: 1, background: '#F3F4F6', color: '#333' }} onClick={onCancel}>Cancel</button>
                    <button className="btn" style={{ flex: 1 }} onClick={() => onSave(val)}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default function AttendancePage({ onBack }) {
    const { permissions } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Remark Modal State
    const [remarkModal, setRemarkModal] = useState({ visible: false, studentId: null, currentRemark: '' })

    // Lock State
    const [isLocked, setIsLocked] = useState(() => localStorage.getItem('attendance_locked') === 'true')

    const toggleLock = () => {
        // Only Admin/Teacher can toggle lock (Assistant cannot unlock if locked? - Logic: "Can Unlock" perm)
        // Actually, Assistants probably shouldn't be locking/unlocking.
        if (!permissions.canUnlockAttendance) {
            alert('Restricted: Only Admins/Teachers can change lock state.')
            return
        }

        const newVal = !isLocked
        setIsLocked(newVal)
        localStorage.setItem('attendance_locked', newVal)
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    async function fetchStudents() {
        try {
            setLoading(true)
            if (!supabase) return
            const { data: studentData, error: studentError } = await supabase.from('students').select('*').order('full_name')
            if (studentError) throw studentError

            const getLocalDateIndex = () => {
                const d = new Date()
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }
            const today = getLocalDateIndex()
            // Fetch all attendance for today including remarks/verse
            const { data: todayData, error: todayError } = await supabase
                .from('attendance')
                .select('student_id, memory_verse, remarks')
                .eq('date', today)
                .eq('status', 'PRESENT')

            if (todayError) throw todayError

            // Create lookup map
            const attendanceMap = {}
            todayData.forEach(a => {
                attendanceMap[a.student_id] = { present: true, memory_verse: a.memory_verse, remarks: a.remarks }
            })

            // Get historical visits count
            const { data: historyData, error: historyError } = await supabase.from('attendance').select('student_id').eq('status', 'PRESENT')
            if (historyError) throw historyError
            const visitCounts = {}
            historyData.forEach(r => { visitCounts[r.student_id] = (visitCounts[r.student_id] || 0) + 1 })

            const combined = studentData.map(s => {
                const att = attendanceMap[s.id] || { present: false, memory_verse: false, remarks: '' }
                return {
                    ...s,
                    present: att.present,
                    memory_verse: att.memory_verse,
                    remarks: att.remarks,
                    visits: visitCounts[s.id] || 0
                }
            })

            setStudents(combined)
        } catch (error) { setError(error.message) } finally { setLoading(false) }
    }

    const toggleAttendance = async (student) => {
        if (isLocked) return // Locked: No changes
        if (!supabase) return
        const newStatus = !student.present
        const newVisits = newStatus ? student.visits + 1 : student.visits - 1
        const getLocalDateIndex = () => {
            const d = new Date()
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }
        const today = getLocalDateIndex()

        // Optimistic Update
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, present: newStatus } : s))

        try {
            if (newStatus) {
                await supabase.from('attendance').insert({ student_id: student.id, status: 'PRESENT', date: today })
            } else {
                await supabase.from('attendance').delete().eq('student_id', student.id).eq('date', today)
            }
            fetchStudents() // Refresh to sync ID/state fully
        } catch (error) { fetchStudents() }
    }

    const toggleVerse = async (student, e) => {
        e.stopPropagation() // Prevent row click
        if (isLocked) return // Locked
        if (!student.present) { alert('Mark them present first!'); return; }

        const newVal = !student.memory_verse
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, memory_verse: newVal } : s))

        const getLocalDateIndex = () => {
            const d = new Date()
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }
        const today = getLocalDateIndex()
        await supabase.from('attendance').update({ memory_verse: newVal }).eq('student_id', student.id).eq('date', today)
    }

    const openRemark = (student, e) => {
        e.stopPropagation()
        if (isLocked) return // Locked
        if (!student.present) { alert('Mark them present first!'); return; }
        setRemarkModal({ visible: true, studentId: student.id, currentRemark: student.remarks })
    }

    const saveRemark = async (text) => {
        const getLocalDateIndex = () => {
            const d = new Date()
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }
        const today = getLocalDateIndex()
        const sid = remarkModal.studentId

        // Update local
        setStudents(prev => prev.map(s => s.id === sid ? { ...s, remarks: text } : s))
        setRemarkModal({ ...remarkModal, visible: false })

        // Update DB
        await supabase.from('attendance').update({ remarks: text }).eq('student_id', sid).eq('date', today)
    }

    const filtered = students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const newKids = filtered.filter(s => s.visits < 3)
    const regulars = filtered.filter(s => s.visits >= 3)

    const renderStudentRow = (student) => (
        <div key={student.id} className="card student-card" style={{ cursor: 'default' }}>
            <div className="student-info" style={{ flex: 1 }}>
                <h3>{student.full_name} {student.nickname && <span style={{ color: 'var(--primary)', fontWeight: 'normal' }}>"{student.nickname}"</span>}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{student.grade_level || 'No Grade'}</span>
                    {student.visits < 3 && student.visits > 0 && (
                        <span className={`badge visit-${student.visits}`}>
                            {student.visits === 1 ? '1st VISIT' : '2nd VISIT'}
                        </span>
                    )}
                    {student.visits === 0 && <span className="badge visit-1">NEW</span>}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: isLocked ? 0.5 : 1 }}>
                {/* Actions (Only show if present) */}
                {student.present && (
                    <>
                        <button className={`action-btn ${student.memory_verse ? 'active-verse' : ''}`} onClick={(e) => toggleVerse(student, e)} disabled={isLocked}>
                            <BookOpen size={16} />
                        </button>
                        <button className={`action-btn ${student.remarks ? 'active-remark' : ''}`} onClick={(e) => openRemark(student, e)} disabled={isLocked}>
                            <MessageSquare size={16} fill={student.remarks ? 'currentColor' : 'none'} />
                        </button>
                    </>
                )}

                <div
                    className={`check-btn ${student.present ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleAttendance(student); }}
                    style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                >
                    {isLocked ? (
                        <Lock size={16} color={student.present ? 'white' : 'var(--text-muted)'} />
                    ) : (
                        <CheckCircle size={24} fill={student.present ? 'white' : 'none'} color={student.present ? 'white' : 'var(--border-color)'} />
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="page slide-in">
            <header className="page-header">
                <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Attendance</h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date().toDateString()}</span>
                </div>
                <button
                    onClick={toggleLock}
                    style={{
                        background: isLocked ? '#FEE2E2' : '#F3F4F6',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        color: isLocked ? '#DC2626' : '#6B7280',
                        cursor: 'not-allowed', // Default pointer, but if permission missing? logic above handles it
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{isLocked ? 'LOCKED' : 'OPEN'}</span>
                </button>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="search-bar">
                <input type="text" placeholder="Search name..." className="input search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={20} className="search-icon" />
            </div>

            <div className="student-list">
                {loading ? <div className="empty-state">Loading...</div> : filtered.length === 0 ? <div className="empty-state">No student found.</div> : (
                    <>
                        {newKids.length > 0 && (
                            <>
                                <div className="section-header">New Kids / Visitors ({newKids.length})</div>
                                {newKids.map(renderStudentRow)}
                            </>
                        )}

                        {regulars.length > 0 && (
                            <>
                                <div className="section-header">Regulars ({regulars.length})</div>
                                {regulars.map(renderStudentRow)}
                            </>
                        )}
                    </>
                )}
            </div>

            <RemarkModal
                visible={remarkModal.visible}
                initialValue={remarkModal.currentRemark}
                onCancel={() => setRemarkModal({ ...remarkModal, visible: false })}
                onSave={saveRemark}
            />
        </div>
    )
}
