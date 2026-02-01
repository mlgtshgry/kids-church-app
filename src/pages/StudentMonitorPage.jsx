import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowUpDown, Search, User, CheckCircle, Star, Calendar, BookOpen, QrCode, Trophy, Award, Flame } from 'lucide-react'
import QRCode from 'react-qr-code'
import { supabase } from '../supabase'

function TrophyCase({ stats }) {
    // Helper to determine rank
    const getRank = (val, bronze, silver, gold) => {
        if (val >= gold) return 'gold'
        if (val >= silver) return 'silver'
        if (val >= bronze) return 'bronze'
        return 'locked'
    }

    // Tiers configuration
    // Attendance: 1, 3, 10
    // Verses: 1, 5, 10
    const attendanceRank = getRank(stats.total, 1, 3, 10)
    const verseRank = getRank(stats.verses, 1, 5, 10)
    const streakRank = getRank(stats.streak, 2, 4, 8)

    const achievements = [
        {
            id: 'attendance',
            title: attendanceRank === 'bronze' ? 'First Step' : attendanceRank === 'silver' ? 'Regular' : 'Rising Star',
            desc: attendanceRank === 'gold' ? '10+ Visits' : 'Attendance',
            icon: <Star size={24} fill={attendanceRank === 'gold' ? '#F59E0B' : 'currentColor'} color={attendanceRank === 'gold' ? '#D97706' : attendanceRank === 'silver' ? '#64748B' : '#92400E'} />,
            rank: attendanceRank
        },
        {
            id: 'verses',
            title: verseRank === 'bronze' ? 'Student' : verseRank === 'silver' ? 'Scholar' : 'Bible Champ',
            desc: verseRank === 'gold' ? '10 Verses' : 'Bible Verse',
            icon: <Award size={24} fill={verseRank === 'gold' ? '#F59E0B' : 'currentColor'} color={verseRank === 'gold' ? '#D97706' : verseRank === 'silver' ? '#64748B' : '#92400E'} />,
            rank: verseRank
        },
        {
            id: 'streak',
            title: streakRank === 'bronze' ? 'Warming Up' : streakRank === 'silver' ? 'On Fire' : 'Unstoppable',
            desc: streakRank === 'gold' ? '8 Weeks!' : 'Streak',
            icon: <Flame size={24} fill={streakRank === 'gold' ? '#EF4444' : 'currentColor'} color={streakRank === 'gold' ? '#B91C1C' : streakRank === 'silver' ? '#64748B' : '#92400E'} />,
            rank: streakRank
        }
    ]

    return (
        <div style={{ padding: '0 20px 20px' }}>
            <h3 className="section-header" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="#D97706" /> Achievements
            </h3>
            <div className="trophy-grid">
                {achievements.map((a, i) => (
                    <div key={i} className={`trophy-card ${a.rank !== 'locked' ? 'unlocked' : ''} rank-${a.rank}`}>
                        <span className="trophy-icon">{a.icon}</span>
                        <div className="trophy-title">{a.title}</div>
                        <div className="trophy-desc">{a.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StudentProfile({ student, onBack }) {
    const [history, setHistory] = useState([])
    const [stats, setStats] = useState({ total: 0, verses: 0, streak: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // If Demo Student
        if (student.isDemo) {
            setLoading(false)
            setStats(student.demoStats)
            setHistory(student.demoHistory)
            return
        }
        fetchHistory()
    }, [student])

    async function fetchHistory() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('student_id', student.id)
                .eq('status', 'PRESENT')
                .order('date', { ascending: false })

            if (error) throw error
            setHistory(data)

            const total = data.length
            const verses = data.filter(d => d.memory_verse).length

            // Calculate basic streak (consecutive recent entries)
            // This is a rough estimation for V1
            let streak = 0
            if (data.length > 0) streak = Math.min(total, data.length) // Placeholder logic, real logic needs date diffs

            setStats({ total, verses, streak })
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }

    // Check if attended today
    const todayStr = new Date().toISOString().split('T')[0]
    const hasAttendedToday = history.some(h => h.date === todayStr) || (student.isDemo && student.demoHistory.some(h => h.date === todayStr))

    const [showQR, setShowQR] = useState(false)

    return (
        <div className="page slide-in" style={{ padding: 0, background: '#F9FAFB' }}>

            {showQR && (
                <div className="modal-overlay fade-in" onClick={() => setShowQR(false)}>
                    <div className="modal-content" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <h3>Student QR Code</h3>
                        <p style={{ marginBottom: '16px', color: '#6B7280' }}>Scan to mark present</p>
                        <div style={{ background: '#fff', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', display: 'inline-block' }}>
                            <QRCode value={student.id} size={200} />
                        </div>
                        <h4 style={{ marginTop: '16px' }}>{student.full_name}</h4>
                        <br />
                        <button className="btn full-width" onClick={() => setShowQR(false)} style={{ marginTop: '16px' }}>Close</button>
                    </div>
                </div>
            )}

            <div className="profile-header">
                <button onClick={onBack} className="back-btn" style={{ position: 'absolute', top: '20px', left: '20px' }}><ArrowLeft size={24} /></button>
                <button onClick={() => setShowQR(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--primary)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}>
                    <QrCode size={20} />
                </button>
                <div className={`big-avatar ${hasAttendedToday ? 'pulsing-border' : ''}`} style={hasAttendedToday ? { border: '4px solid #10B981', color: '#10B981', background: '#ECFDF5', borderRadius: '50%', overflow: 'hidden' } : { borderRadius: '50%', overflow: 'hidden' }}>
                    {student.avatar_url ? (
                        <img src={student.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        student.nickname ? student.nickname[0] : student.full_name[0]
                    )}
                </div>
                <h2 className="profile-name">{student.full_name}</h2>
                <div className="profile-meta">
                    <span>{student.grade_level || 'No Grade'}</span> • <span>{student.gender || 'Student'}</span>
                    {student.nickname && <span>• "{student.nickname}"</span>}
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-val">{stats.total}</span>
                    <span className="stat-label">Attended</span>
                </div>
                <div className="stat-card">
                    <span className="stat-val" style={{ color: '#D97706' }}>{stats.verses}</span>
                    <span className="stat-label">Verses</span>
                </div>
                <div className="stat-card">
                    <span className="stat-val" style={{ color: '#EC4899' }}>{stats.streak}</span>
                    <span className="stat-label">Streak</span>
                </div>
            </div>

            {/* Gamification Section */}
            <TrophyCase stats={stats} />

            <div style={{ padding: '0 20px 20px' }}>
                <h3 className="section-header" style={{ marginBottom: '16px' }}>Attendance History</h3>

                {loading ? <div className="empty-state">Loading...</div> : history.length === 0 ? <div className="empty-state">No attendance recorded.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.map((record, idx) => (
                            <div key={record.id || idx} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#EEF2FF', padding: '8px', borderRadius: '10px', color: 'var(--primary)' }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#1F2937' }}>
                                            {new Date(record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {record.remarks && <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>"{record.remarks}"</div>}
                                    </div>
                                </div>

                                {record.memory_verse && (
                                    <div style={{ background: '#FEF3C7', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <BookOpen size={14} /> Verse
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function StudentMonitorPage({ onBack }) {
    const [view, setView] = useState('list') // list, profile
    const [selectedStudent, setSelectedStudent] = useState(null)

    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('alpha') // alpha | present

    // Virtual Demo Student for Showcase
    const demoStudent = {
        id: 'demo-zion',
        full_name: 'Zion Lion',
        nickname: 'Zion',
        grade_level: 'Grade 3',
        gender: 'Male',
        isDemo: true,
        demoStats: { total: 15, verses: 12, streak: 5 },
        demoHistory: [
            { date: new Date().toISOString().split('T')[0], memory_verse: true, remarks: 'Present today!' },
            { date: '2023-10-27', memory_verse: true, remarks: 'Led the prayer' },
            { date: '2023-10-20', memory_verse: true, remarks: '' },
            { date: '2023-10-13', memory_verse: false, remarks: 'Brought a friend' }
        ]
    }

    const [presentIds, setPresentIds] = useState(new Set())

    useEffect(() => {
        fetchStudents()
        fetchTodayAttendance()
    }, [])

    async function fetchStudents() {
        try {
            const { data } = await supabase.from('students').select('*').order('full_name')
            setStudents(data)
        } catch (e) { } finally { setLoading(false) }
    }

    async function fetchTodayAttendance() {
        try {
            const today = new Date().toISOString().split('T')[0]
            const { data } = await supabase.from('attendance').select('student_id').eq('date', today).eq('status', 'PRESENT')
            if (data) {
                setPresentIds(new Set(data.map(r => r.student_id)))
            }
        } catch (e) { console.error(e) }
    }

    const filtered = students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const sortedStudents = [...filtered].sort((a, b) => {
        if (sortBy === 'present') {
            const aPresent = presentIds.has(a.id)
            const bPresent = presentIds.has(b.id)
            // If one is present and other is not, present comes first
            if (aPresent && !bPresent) return -1
            if (!aPresent && bPresent) return 1
        }
        // Default alphabetical
        return a.full_name.localeCompare(b.full_name)
    })

    // View Switching
    if (view === 'profile' && selectedStudent) {
        return <StudentProfile student={selectedStudent} onBack={() => { setView('list'); setSelectedStudent(null); }} />
    }

    return (
        <div className="page slide-in">
            <header className="page-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                    <h2>Select Student</h2>
                </div>
                <button onClick={() => setSortBy(prev => prev === 'alpha' ? 'present' : 'alpha')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', background: sortBy === 'present' ? '#ECFDF5' : '#fff', color: sortBy === 'present' ? '#059669' : '#374151', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    <ArrowUpDown size={16} />
                    {sortBy === 'present' ? 'Present First' : 'A-Z'}
                </button>
            </header>
            <div className="search-bar">
                <input type="text" placeholder="Search name..." className="input search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={20} className="search-icon" />
            </div>
            <div className="student-list">
                {/* Demo Student Card */}
                <div className="card student-card" onClick={() => { setSelectedStudent(demoStudent); setView('profile'); }} style={{ border: '2px dashed #D97706', background: '#FFFBEB' }}>
                    <div className="student-info">
                        <h3>{demoStudent.full_name} <span className="badge" style={{ background: '#FCD34D', color: '#92400E' }}>DEMO</span></h3>
                        <span>Present Today!</span>
                    </div>
                    <Star size={20} fill="#10B981" color="#10B981" />
                </div>

                {loading ? <div className="empty-state">Loading...</div> : sortedStudents.map(s => {
                    const isPresent = presentIds.has(s.id)
                    return (
                        <div key={s.id} className="card student-card" onClick={() => { setSelectedStudent(s); setView('profile'); }} style={isPresent ? { borderLeft: '3px solid #10B981' } : {}}>
                            <div className="student-info">
                                <h3>{s.full_name}</h3>
                                <span style={isPresent ? { color: '#10B981', fontWeight: 'bold' } : {}}>{isPresent ? 'Present' : (s.nickname || 'View Profile')}</span>
                            </div>
                            <div style={{ color: isPresent ? '#10B981' : 'var(--border-color)' }}>
                                <User size={20} fill={isPresent ? '#ECFDF5' : 'none'} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
