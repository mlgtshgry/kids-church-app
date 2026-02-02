import { useState, useEffect } from 'react'
import { ArrowLeft, History, Shield, Clock } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function LoginHistoryPage({ onBack }) {
    const { user } = useAuth()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        fetchLogs()
    }, [])

    async function fetchLogs() {
        try {
            setLoading(true)
            setErrorMsg(null)
            const { data, error } = await supabase
                .from('login_logs')
                .select('*')
                .order('login_at', { ascending: false })
                .limit(100) // Show last 100 logins

            if (error) throw error
            setLogs(data)
        } catch (e) {
            console.error(e)
            setErrorMsg(e.message)
            setLogs([])
        } finally { setLoading(false) }
    }

    if (user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="page slide-in">
                <header className="page-header"><button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button></header>
                <div className="empty-state">
                    <Shield size={48} color="#DC2626" />
                    <h3>Access Denied</h3>
                    <p>Only the Super Admin can view login logs.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page slide-in">
            <header className="page-header">
                <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                <h2>System Login History</h2>
            </header>

            <div className="student-list" style={{ marginTop: '20px' }}>
                {errorMsg && (
                    <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px' }}>
                        <strong>Error loading logs:</strong><br />
                        {errorMsg}
                    </div>
                )}
                {loading ? <div className="empty-state">Loading logs...</div> : logs.length === 0 && !errorMsg ? <div className="empty-state">No logins recorded yet.</div> : (
                    logs.map(log => (
                        <div key={log.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>
                                    {log.full_name}
                                </h3>
                                <span className={`badge ${log.role === 'SUPER_ADMIN' ? 'visit-3' : (log.role === 'ADMIN' ? 'visit-2' : 'visit-1')}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                                    {log.role}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '12px', color: '#6B7280' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                                    <Clock size={14} />
                                    {new Date(log.login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div>
                                    {new Date(log.login_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
