import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import { supabase } from '../supabase'

export default function AttendanceChart() {
    const [data, setData] = useState([])
    const [maxVal, setMaxVal] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            if (!supabase) return
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
