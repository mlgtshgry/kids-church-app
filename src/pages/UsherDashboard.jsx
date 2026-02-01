import { useState } from 'react'
import { Users, ClipboardList, Contact, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function UsherDashboard({ onNavigate }) {
    const { user, logout } = useAuth()

    return (
        <div className="page fade-in">
            <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', color: '#111827' }}>Usher Team</h1>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>{user?.full_name} ({user?.role})</p>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px' }} title="Logout">
                    <LogOut size={24} />
                    <span>Logout</span>
                </button>
            </header>

            <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px' }}>

                <button className="menu-card primary" onClick={() => onNavigate('service-attendance')} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px', aspectRatio: '1/1' }}>
                    <div className="icon-bg" style={{ background: 'transparent', color: '#059669', marginBottom: '8px' }}><Users size={40} /></div>
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Service Attendance</h3>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Check-in Members</p>
                    </div>
                </button>

                <button className="menu-card" onClick={() => onNavigate('member-manager')} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px', aspectRatio: '1/1' }}>
                    <div className="icon-bg" style={{ background: 'transparent', color: '#C2410C', marginBottom: '8px' }}><Contact size={40} /></div>
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Member Directory</h3>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Add or Edit Profiles</p>
                    </div>
                </button>

                <button className="menu-card" onClick={() => onNavigate('member-reports')} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px', aspectRatio: '1/1' }}>
                    <div className="icon-bg" style={{ background: 'transparent', color: '#7C3AED', marginBottom: '8px' }}><ClipboardList size={40} /></div>
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Reports & Export</h3>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>View History</p>
                    </div>
                </button>

                {user?.role === 'USHER_ADMIN' && (
                    <button className="menu-card" onClick={() => onNavigate('user-manager')} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', gap: '12px', aspectRatio: '1/1' }}>
                        <div className="icon-bg" style={{ background: 'transparent', color: '#2563EB', marginBottom: '8px' }}><Shield size={40} /></div>
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Manage Ushers</h3>
                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Admin Controls</p>
                        </div>
                    </button>
                )}

            </div>
        </div>
    )
}
