import { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, MessageSquare } from 'lucide-react'
import { supabase } from '../supabase'

export default function ActivityLogPage({ onBack }) {
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
