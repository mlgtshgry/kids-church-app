import { useState, useEffect } from 'react'
import { ArrowLeft, Search, CheckCircle, Calendar, Users } from 'lucide-react'
import { supabase } from '../supabase'

export default function ServiceAttendance({ onBack }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date()
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    })
    const [serviceType, setServiceType] = useState('MORNING_SERVICE')

    useEffect(() => {
        fetchMembersAndAttendance()
    }, [selectedDate, serviceType])

    async function fetchMembersAndAttendance() {
        try {
            setLoading(true)

            // 1. Fetch Members
            const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('*')
                .order('full_name') // TODO: Order by last name if possible, or full name

            if (memberError) throw memberError

            // 2. Fetch Attendance for Date & Service
            const { data: attendanceData, error: attendanceError } = await supabase
                .from('member_attendance')
                .select('member_id, status')
                .eq('date', selectedDate)
                .eq('service_type', serviceType)
                .eq('status', 'PRESENT')

            if (attendanceError) throw attendanceError

            // 3. Merge Data
            const presentIds = new Set(attendanceData.map(a => a.member_id))

            const merged = memberData.map(m => ({
                ...m,
                present: presentIds.has(m.id)
            }))

            setMembers(merged)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const toggleAttendance = async (member) => {
        const newStatus = !member.present

        // Optimistic Update
        setMembers(prev => prev.map(m => m.id === member.id ? { ...m, present: newStatus } : m))

        try {
            if (newStatus) {
                // Check In
                await supabase.from('member_attendance').insert({
                    member_id: member.id,
                    date: selectedDate,
                    service_type: serviceType,
                    status: 'PRESENT'
                })
            } else {
                // Cancel Check In
                await supabase.from('member_attendance').delete()
                    .eq('member_id', member.id)
                    .eq('date', selectedDate)
                    .eq('service_type', serviceType)
            }
        } catch (e) {
            console.error(e)
            // Revert on error
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, present: !newStatus } : m))
            alert('Error updating attendance')
        }
    }

    // Filter
    const filtered = members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Stats
    const totalPresent = members.filter(m => m.present).length

    return (
        <div className="page slide-in">
            <header className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                        <h2>Check-In</h2>
                    </div>
                    <div style={{ background: '#ECFDF5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} /> {totalPresent} Present
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            type="date"
                            className="input"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <select
                            className="input"
                            value={serviceType}
                            onChange={e => setServiceType(e.target.value)}
                        >
                            <option value="MORNING_SERVICE">🌞 Morning</option>
                            <option value="EVENING_SERVICE">🌙 Evening</option>
                            <option value="SPECIAL_EVENT">🎉 Special</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="search-bar">
                <input type="text" placeholder="Search member..." className="input search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search size={20} className="search-icon" />
            </div>

            <div className="student-list">
                {loading ? <p>Loading...</p> : filtered.length === 0 ? <p className="empty-state">No members found.</p> : filtered.map(m => (
                    <div
                        key={m.id}
                        className="student-card"
                        onClick={() => toggleAttendance(m)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="student-info">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                {m.full_name}
                                <span className={`badge ${m.age_group === 'YOUTH' ? 'visit-2' : (m.age_group === 'SENIOR' ? 'visit-3' : 'visit-1')}`} style={{ fontSize: '10px', marginTop: 0 }}>
                                    {m.age_group}
                                </span>
                            </h3>
                        </div>

                        <div className={`check-btn ${m.present ? 'active' : ''}`}>
                            <CheckCircle size={24} fill={m.present ? 'white' : 'none'} color={m.present ? 'white' : 'var(--border-color)'} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
