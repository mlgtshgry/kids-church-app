import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, HeartHandshake } from 'lucide-react'
import { supabase } from '../supabase'

export default function FollowUpPage({ onBack }) {
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
