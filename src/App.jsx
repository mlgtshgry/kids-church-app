import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './gamification.css'
import { CheckCircle, Search, Plus, ArrowLeft, Home, Users, ClipboardList, PenLine, Trash2, AlertTriangle, HeartHandshake, Contact, HelpCircle, BarChart2, Gift, BookOpen, MessageSquare, X, Activity, User, Flame, Trophy, Calendar, Info, Award, Star } from 'lucide-react'

// --- COMPONENTS ---

function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/newlogo.png" alt="Logo" className="splash-logo" style={{ width: '120px', height: '120px', borderRadius: '20px', marginBottom: '16px', objectFit: 'cover' }} />
        <h1 className="splash-title">Kid's Church</h1>
        <p className="splash-text">Attendance</p>
      </div>
    </div>
  )
}

function AttendanceChart() {
  const [data, setData] = useState([])
  const [maxVal, setMaxVal] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('date')
        .eq('status', 'PRESENT')
        .order('date', { ascending: true })

      if (error) throw error

      const grouped = {}
      data.forEach(r => {
        grouped[r.date] = (grouped[r.date] || 0) + 1
      })

      const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b))
      const last5Keys = sortedKeys.slice(-5)

      const chartData = last5Keys.map(date => ({
        date,
        count: grouped[date],
        label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))

      const max = Math.max(...chartData.map(d => d.count), 1)

      setData(chartData)
      setMaxVal(max)
    } catch (e) { console.error(e) }
  }

  if (data.length === 0) return null

  return (
    <div className="chart-card fade-in">
      <div className="chart-header">
        <BarChart2 size={16} />
        <span>Attendance Trend</span>
      </div>
      <div className="chart-container">
        {data.map(d => (
          <div key={d.date} className="chart-bar-group">
            <span className="chart-value">{d.count}</span>
            <div className="chart-bar" style={{ height: '100%' }}>
              <div
                style={{
                  height: `${(d.count / maxVal) * 100}%`,
                  background: 'var(--primary)',
                  borderRadius: '6px 6px 0 0',
                  width: '100%',
                  position: 'absolute',
                  bottom: 0,
                  transition: 'height 1s ease-out'
                }}
              />
            </div>
            <span className="chart-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BirthdayCard() {
  const [birthdays, setBirthdays] = useState([])

  useEffect(() => {
    fetchBirthdays()
  }, [])

  async function fetchBirthdays() {
    try {
      const { data, error } = await supabase.from('students').select('*')
      if (error) throw error

      const currentMonth = new Date().getMonth() // 0-11
      const upcoming = data.filter(s => {
        if (!s.birthday) return false
        const bdate = new Date(s.birthday)
        return bdate.getMonth() === currentMonth
      }).sort((a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate())

      setBirthdays(upcoming)
    } catch (e) { console.error(e) }
  }

  if (birthdays.length === 0) return null

  return (
    <div className="birthday-card fade-in">
      <div className="birthday-header">
        <Gift size={18} />
        <span>Birthdays this Month</span>
      </div>
      <div className="birthday-list">
        {birthdays.map(s => (
          <div key={s.id} className="birthday-item">
            <div className="birthday-name">{s.nickname || s.full_name.split(' ')[0]}</div>
            <div className="birthday-date">
              {new Date(s.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomePage({ onNavigate }) {
  return (
    <div className="page fade-in">
      <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
        <div>
          <h1>Welcome Back!</h1>
          <p>Ready for class today?</p>
        </div>
        <button onClick={() => onNavigate('info')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
          <HelpCircle size={28} />
        </button>
      </header>

      <AttendanceChart />
      <BirthdayCard />

      <div className="menu-grid">
        <button className="menu-card primary" onClick={() => onNavigate('attendance')}>
          <div className="icon-bg"><Users size={32} /></div>
          <h3>Attendance</h3>
          <p>Mark students present</p>
        </button>

        <button className="menu-card secondary" onClick={() => onNavigate('activity-log')}>
          <div className="icon-bg"><Activity size={32} /></div>
          <h3>Activity Log</h3>
          <p>Notes & Verse History</p>
        </button>

        <button className="menu-card danger" onClick={() => onNavigate('follow-up')}>
          <div className="icon-bg"><AlertTriangle size={32} /></div>
          <h3>Follow Up</h3>
          <p>Missed 3+ Sundays</p>
        </button>

        <button className="menu-card accent" onClick={() => onNavigate('student-monitor')}>
          <div className="icon-bg"><User size={32} /></div>
          <h3>Profiles</h3>
          <p>Stats & History</p>
        </button>

        <button className="menu-card" onClick={() => onNavigate('reports')}>
          <div className="icon-bg" style={{ background: '#EDE9FE', color: '#7C3AED' }}><ClipboardList size={32} /></div>
          <h3>Reports</h3>
          <p>Full History</p>
        </button>

        <button className="menu-card" onClick={() => onNavigate('student-manager')}>
          <div className="icon-bg" style={{ background: '#FFEDD5', color: '#C2410C' }}><Contact size={32} /></div>
          <h3>Manage</h3>
          <p>Add/Edit Students</p>
        </button>
      </div>
    </div>
  )
}

function ActivityLog({ onBack }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('attendance')
        .select(`date, remarks, memory_verse, students (full_name, nickname)`)
        .or('memory_verse.eq.true,remarks.neq.null') // Only interesting ones
        .order('date', { ascending: false })

      if (error) throw error

      // Group by date
      const grouped = {}
      data.forEach(item => {
        if (!grouped[item.date]) grouped[item.date] = { date: item.date, verses: [], remarks: [] }
        if (item.memory_verse) grouped[item.date].verses.push(item.students.nickname || item.students.full_name)
        if (item.remarks) grouped[item.date].remarks.push({ name: item.students.nickname || item.students.full_name, note: item.remarks })
      })

      setLogs(Object.values(grouped))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="page slide-in" style={{ background: '#FAFAFA' }}>
      <header className="page-header" style={{ background: '#fff', margin: 0, padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
        <h2>Activity Log</h2>
      </header>

      <div className="timeline">
        {loading ? <div className="empty-state">Loading...</div> : logs.length === 0 ? <div className="empty-state">No activity yet.</div> : (
          logs.map(log => (
            <div key={log.date} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-date">{formatDate(log.date)}</div>

              {log.verses.length > 0 && (
                <div className="timeline-card timeline-section">
                  <div className="timeline-title" style={{ color: '#D97706' }}>
                    <BookOpen size={14} /> Memory Verses ({log.verses.length})
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#374151' }}>
                    {log.verses.join(', ')}
                  </p>
                </div>
              )}

              {log.remarks.length > 0 && (
                <div className="timeline-card timeline-section">
                  <div className="timeline-title" style={{ color: 'var(--primary)' }}>
                    <MessageSquare size={14} /> Remarks
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {log.remarks.map((r, i) => (
                      <div key={i} style={{ fontSize: '13px' }}>
                        <span style={{ fontWeight: '700', color: '#111827' }}>{r.name}:</span> <span style={{ color: '#4B5563' }}>{r.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

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

  return (
    <div className="page slide-in" style={{ padding: 0, background: '#F9FAFB' }}>
      <div className="profile-header">
        <button onClick={onBack} className="back-btn" style={{ position: 'absolute', top: '20px', left: '20px' }}><ArrowLeft size={24} /></button>
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

function StudentMonitor({ onBack, onSelect }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <div className="page slide-in">
      <header className="page-header">
        <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
        <h2>Select Student</h2>
      </header>
      <div className="search-bar">
        <input type="text" placeholder="Search name..." className="input search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Search size={20} className="search-icon" />
      </div>
      <div className="student-list">
        {/* Demo Student Card */}
        <div className="card student-card" onClick={() => onSelect(demoStudent)} style={{ border: '2px dashed #D97706', background: '#FFFBEB' }}>
          <div className="student-info">
            <h3>{demoStudent.full_name} <span className="badge" style={{ background: '#FCD34D', color: '#92400E' }}>DEMO</span></h3>
            <span>Present Today!</span>
          </div>
          <Star size={20} fill="#10B981" color="#10B981" />
        </div>

        {loading ? <div className="empty-state">Loading...</div> : filtered.map(s => {
          const isPresent = presentIds.has(s.id)
          return (
            <div key={s.id} className="card student-card" onClick={() => onSelect(s)} style={isPresent ? { borderLeft: '3px solid #10B981' } : {}}>
              <div className="student-info">
                <h3>{s.full_name}</h3>
                <span style={isPresent ? { color: '#10B981', fontWeight: 'bold' } : {}}>{isPresent ? 'Present' : (s.nickname || 'View Profile')}</span>
              </div>
              <User size={20} color={isPresent ? '#10B981' : 'var(--border-color)'} fill={isPresent ? '#ECFDF5' : 'none'} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoPage({ onBack }) {
  return (
    <div className="page slide-in">
      <header className="page-header">
        <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
        <h2>Guidelines</h2>
      </header>

      <div style={{ padding: '0 8px' }}>
        <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" /> New vs Regulars
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
            <strong>New Kids:</strong> Any child who has visited less than 3 times. They get a special badge so you can welcome them!
            <br /><br />
            <strong>Regulars:</strong> Once a child visits for the 3rd time, they automatically become a "Regular".
          </p>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #D97706' }}>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
            <BookOpen size={20} /> Bible Verse & Notes
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
            When marking attendance, tap the details:
            <br /><br />
            <strong style={{ color: '#D97706' }}><BookOpen size={14} style={{ display: 'inline', marginRight: 4 }} /> Bible Icon:</strong> Click this if the student can recite the Memory Verse for the day.
            <br /><br />
            <strong style={{ color: 'var(--primary)' }}><MessageSquare size={14} style={{ display: 'inline', marginRight: 4 }} /> Note Icon:</strong> Use this to add remarks (e.g. "Sick", "Fetched by Lola").
          </p>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #F59E0B' }}>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
            <Trophy size={20} /> Achievements
          </h3>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '12px' }}>Every medal has 3 Levels: <strong>Bronze</strong>, <strong>Silver</strong>, and <strong>Gold</strong>.</p>

            <div style={{ marginBottom: '8px' }}>
              <strong>🏆 Attendance</strong>
              <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                <li>1st Visit: First Step</li>
                <li>3 Visits: Regular</li>
                <li>10 Visits: <strong>Rising Star</strong> (Gold)</li>
              </ul>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>📖 Bible Verses</strong>
              <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                <li>1 Verse: Student</li>
                <li>5 Verses: Scholar</li>
                <li>10 Verses: <strong>Bible Champ</strong> (Gold)</li>
              </ul>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>🔥 Weekly Streak</strong>
              <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                <li>2 Weeks: Warming Up</li>
                <li>4 Weeks: On Fire</li>
                <li>8 Weeks: <strong>Unstoppable</strong> (Gold)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #DC2626' }}>
          <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
            <AlertTriangle size={20} /> Follow Up
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
            The app monitors attendance automatically.
            <br /><br />
            If a student is <strong>absent for 3 consecutive Sundays</strong> (based on the last 3 recorded dates), they will appear in the "Follow Up" list so you can visit them.
          </p>
        </div>
      </div>
    </div>
  )
}

function FollowUpList({ onBack }) {
  const [absentees, setAbsentees] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastDates, setLastDates] = useState([])

  useEffect(() => {
    fetchAbsentees()
  }, [])

  async function fetchAbsentees() {
    try {
      setLoading(true)
      const { data: dateData, error: dateError } = await supabase
        .from('attendance')
        .select('date')
        .eq('status', 'PRESENT')
        .order('date', { ascending: false })

      const demoAbsentee = {
        id: 'demo-absent',
        full_name: 'Sleeping Sam (Demo)',
        grade_level: 'Grade 1',
        avatar_url: null,
        isDemo: true
      }

      if (dateError) throw dateError
      const uniqueDates = [...new Set(dateData.map(d => d.date))].slice(0, 3)
      setLastDates(uniqueDates)

      if (uniqueDates.length < 3) {
        // Even if not enough history, show Demo Student for showcase
        setAbsentees([demoAbsentee])
        return
      }

      const { data: presenceData, error: presenceError } = await supabase
        .from('attendance')
        .select('student_id')
        .in('date', uniqueDates)
        .eq('status', 'PRESENT')
      if (presenceError) throw presenceError

      const presentStudentIds = new Set(presenceData.map(p => p.student_id))

      const { data: allStudents, error: studentError } = await supabase
        .from('students')
        .select('*')
        .order('full_name')
      if (studentError) throw studentError

      const missing = allStudents.filter(s => !presentStudentIds.has(s.id))
      setAbsentees([...missing, demoAbsentee])

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page slide-in">
      <header className="page-header">
        <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>To Visit / Follow Up</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Missed the last 3 Sundays</span>
        </div>
      </header>

      {lastDates.length < 3 && !loading && (
        <div className="error-banner" style={{ background: '#FFF7ED', color: '#C2410C', borderColor: '#FFEDD5' }}>
          Not enough history yet ({lastDates.length}/3 Sundays).
        </div>
      )}

      <div className="student-list">
        {loading ? (
          <div className="empty-state">Calculating...</div>
        ) : absentees.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} style={{ marginBottom: '16px', color: 'var(--success)' }} />
            <p>Good news! Everyone has attended at least once recently.</p>
          </div>
        ) : (
          absentees.map(student => (
            <div key={student.id} className="card student-card" style={{ cursor: 'default' }}>
              <div className="student-info">
                <h3>{student.full_name}</h3>
                <span style={{ color: '#EF4444', fontWeight: '500' }}>Missed 3 Consecutive</span>
              </div>
              <div style={{ background: '#FEE2E2', padding: '8px', borderRadius: '50%', color: '#DC2626' }}>
                <HeartHandshake size={24} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ReportsDashboard({ onNavigate, onSelectDate }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('status', 'PRESENT')
        .order('date', { ascending: false })

      if (error) throw error
      const grouped = {}
      data.forEach(record => {
        if (!grouped[record.date]) { grouped[record.date] = 0 }
        grouped[record.date]++
      })
      const reportList = Object.keys(grouped).map(date => ({ date, count: grouped[date] }))
      setReports(reportList)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="page slide-in">
      <header className="page-header">
        <button onClick={() => onNavigate('home')} className="back-btn"><ArrowLeft size={24} /></button>
        <h2>Reports</h2>
      </header>
      <div className="student-list">
        {loading ? <div className="empty-state">Loading reports...</div> : reports.length === 0 ? <div className="empty-state">No attendance records found.</div> : (
          reports.map(report => (
            <div key={report.date} className="card student-card" onClick={() => onSelectDate(report.date)}>
              <div className="student-info">
                <h3>{formatDate(report.date)}</h3>
                <span>{report.count} Present</span>
              </div>
              <div style={{ color: 'var(--primary)' }}><ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} /></div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ReportDetail({ date, onBack }) {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendees()
  }, [date])

  async function fetchAttendees() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('attendance')
        .select(`status, students (full_name, grade_level)`)
        .eq('date', date)
        .eq('status', 'PRESENT')
      if (error) throw error
      setAttendees(data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { dateStyle: 'full' })

  return (
    <div className="page slide-in">
      <header className="page-header">
        <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Present List</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(date)}</span>
        </div>
      </header>
      <div className="student-list">
        {loading ? <div className="empty-state">Loading...</div> : attendees.length === 0 ? <div className="empty-state">No one marked present.</div> : (
          attendees.map((record, index) => (
            <div key={index} className="card student-card" style={{ cursor: 'default' }}>
              <div className="student-info">
                <h3>{record.students.full_name}</h3>
                <span>{record.students.grade_level || 'No Grade'}</span>
              </div>
              <div className="check-btn active" style={{ width: '24px', height: '24px' }}>
                <CheckCircle size={16} color="white" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StudentForm({ onBack, onComplete, initialData }) {
  const [name, setName] = useState(initialData?.full_name || '')
  const [grade, setGrade] = useState(initialData?.grade_level || '')
  const [parentName, setParentName] = useState(initialData?.parent_name || '')
  const [contactNumber, setContactNumber] = useState(initialData?.contact_number || '')
  const [nickname, setNickname] = useState(initialData?.nickname || '')
  const [gender, setGender] = useState(initialData?.gender || 'Male')
  const [birthday, setBirthday] = useState(initialData?.birthday || '')
  const [loading, setLoading] = useState(false)
  const isEdit = !!initialData

  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [uploading, setUploading] = useState(false)

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
          <input type="date" className="input" value={birthday} onChange={e => setBirthday(e.target.value)} />
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
        {isEdit && (
          <button type="button" onClick={handleDelete} className="btn full-width" style={{ background: '#FEE2E2', color: '#DC2626', marginTop: '12px' }} disabled={loading}>
            <Trash2 size={20} style={{ marginRight: '8px' }} /> Delete Student
          </button>
        )}
      </form>
    </div>
  )
}

function StudentManager({ onBack, onAdd, onEdit }) {
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

  return (
    <div className="page slide-in">
      <header className="page-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
          <h2>Manage Students</h2>
        </div>
        <button onClick={onAdd} className="btn" style={{ padding: '8px 12px', fontSize: '14px' }}>
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
            <div key={student.id} className="card student-card" onClick={() => onEdit(student)}>
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

function AttendanceList({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Remark Modal State
  const [remarkModal, setRemarkModal] = useState({ visible: false, studentId: null, currentRemark: '' })

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      setLoading(true)
      if (!supabase) return
      const { data: studentData, error: studentError } = await supabase.from('students').select('*').order('full_name')
      if (studentError) throw studentError

      const today = new Date().toISOString().split('T')[0]
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
    if (!supabase) return
    const newStatus = !student.present
    const newVisits = newStatus ? student.visits + 1 : student.visits - 1
    const today = new Date().toISOString().split('T')[0]

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
    if (!student.present) { alert('Mark them present first!'); return; }

    const newVal = !student.memory_verse
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, memory_verse: newVal } : s))

    const today = new Date().toISOString().split('T')[0]
    await supabase.from('attendance').update({ memory_verse: newVal }).eq('student_id', student.id).eq('date', today)
  }

  const openRemark = (student, e) => {
    e.stopPropagation()
    if (!student.present) { alert('Mark them present first!'); return; }
    setRemarkModal({ visible: true, studentId: student.id, currentRemark: student.remarks })
  }

  const saveRemark = async (text) => {
    const today = new Date().toISOString().split('T')[0]
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
    <div key={student.id} className="card student-card" onClick={() => toggleAttendance(student)}>
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

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Actions (Only show if present) */}
        {student.present && (
          <>
            <button className={`action-btn ${student.memory_verse ? 'active-verse' : ''}`} onClick={(e) => toggleVerse(student, e)}>
              <BookOpen size={16} />
            </button>
            <button className={`action-btn ${student.remarks ? 'active-remark' : ''}`} onClick={(e) => openRemark(student, e)}>
              <MessageSquare size={16} fill={student.remarks ? 'currentColor' : 'none'} />
            </button>
          </>
        )}

        <div className={`check-btn ${student.present ? 'active' : ''}`}>
          <CheckCircle size={24} fill={student.present ? 'white' : 'none'} color={student.present ? 'white' : 'var(--border-color)'} />
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

function App() {
  const [view, setView] = useState('splash')
  const [selectedReportDate, setSelectedReportDate] = useState(null)
  const [bookingToEdit, setBookingToEdit] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null) // For Profile

  const navigate = (newView) => setView(newView)

  if (view === 'splash') return <Splash onFinish={() => navigate('home')} />
  if (view === 'home') return <HomePage onNavigate={navigate} />

  if (view === 'info') return <InfoPage onBack={() => navigate('home')} />

  if (view === 'add-student') return (
    <StudentForm
      onBack={() => navigate('student-manager')}
      onComplete={() => navigate('student-manager')}
      initialData={null}
    />
  )

  if (view === 'edit-student') return (
    <StudentForm
      onBack={() => { setBookingToEdit(null); navigate('student-manager'); }}
      onComplete={() => { setBookingToEdit(null); navigate('student-manager'); }}
      initialData={bookingToEdit}
    />
  )

  if (view === 'student-manager') return (
    <StudentManager
      onBack={() => navigate('home')}
      onAdd={() => navigate('add-student')}
      onEdit={(student) => {
        setBookingToEdit(student)
        navigate('edit-student')
      }}
    />
  )

  if (view === 'student-monitor') return (
    <StudentMonitor
      onBack={() => navigate('home')}
      onSelect={(student) => {
        setSelectedStudent(student)
        navigate('student-profile')
      }}
    />
  )

  if (view === 'student-profile') return (
    <StudentProfile
      student={selectedStudent}
      onBack={() => navigate('student-monitor')}
    />
  )

  if (view === 'activity-log') return <ActivityLog onBack={() => navigate('home')} />

  if (view === 'reports') return <ReportsDashboard onNavigate={navigate} onSelectDate={(date) => { setSelectedReportDate(date); navigate('report-detail'); }} />
  if (view === 'report-detail') return <ReportDetail date={selectedReportDate} onBack={() => navigate('reports')} />
  if (view === 'follow-up') return <FollowUpList onBack={() => navigate('home')} />

  return (
    <AttendanceList onBack={() => navigate('home')} />
  )
}

export default App
