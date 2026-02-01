import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../supabase'

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

export default function ReportsPage({ onNavigate }) {
    const [view, setView] = useState('list')
    const [selectedDate, setSelectedDate] = useState(null)

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

    if (view === 'detail') {
        return <ReportDetail date={selectedDate} onBack={() => setView('list')} />
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
                        <div key={report.date} className="card student-card" onClick={() => { setSelectedDate(report.date); setView('detail'); }}>
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
