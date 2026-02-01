import { useState, useEffect } from 'react'
import { Gift } from 'lucide-react'
import { supabase } from '../supabase'

export default function BirthdayCard() {
    const [birthdays, setBirthdays] = useState([])

    useEffect(() => {
        fetchBirthdays()
    }, [])

    async function fetchBirthdays() {
        try {
            if (!supabase) return
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
