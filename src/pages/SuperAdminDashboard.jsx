
import { Users, Shield, Contact, History, LayoutGrid, LogOut, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SuperAdminDashboard({ onNavigate }) {
    const { user, logout } = useAuth()

    return (
        <div className="page fade-in">
            <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', color: '#111827' }}>Super Admin Hub</h1>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>Welcome, {user?.full_name}</p>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px' }} title="Logout">
                    <LogOut size={24} />
                    <span>Logout</span>
                </button>
            </header>

            <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px' }}>

                {/* --- DASHBOARDS --- */}
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Access Dashboards
                </div>

                <button className="menu-card" onClick={() => onNavigate('home')} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', gap: '8px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1px solid #BFDBFE' }}>
                    <div className="icon-bg" style={{ background: 'white', color: '#2563EB', marginBottom: '8px' }}><LayoutGrid size={32} /></div>
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '2px', color: '#1E40AF' }}>Kids Ministry</h3>
                        <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, color: '#1E3A8A' }}>Open Kids Dashboard</p>
                    </div>
                </button>

                <button className="menu-card" onClick={() => onNavigate('usher-dashboard')} style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', gap: '8px', background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)', border: '1px solid #FBCFE8' }}>
                    <div className="icon-bg" style={{ background: 'white', color: '#BE185D', marginBottom: '8px' }}><Users size={32} /></div>
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '2px', color: '#9D174D' }}>Usher Team</h3>
                        <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, color: '#831843' }}>Open Usher Dashboard</p>
                    </div>
                </button>


                {/* --- MANAGEMENT --- */}
                <div style={{ gridColumn: '1 / -1', marginTop: '20px', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Administration
                </div>

                <button className="menu-card" onClick={() => onNavigate('kids-staff')} style={{ flexDirection: 'row', alignItems: 'center', padding: '16px', gap: '12px', background: 'white', border: '1px solid #E5E7EB' }}>
                    <div className="icon-bg" style={{ background: '#F3F4F6', color: '#4B5563', width: '40px', height: '40px' }}><Shield size={20} /></div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '2px' }}>Kids Staff</h3>
                        <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>Manage Teachers</p>
                    </div>
                    <ArrowRight size={16} color="#9CA3AF" />
                </button>

                <button className="menu-card" onClick={() => onNavigate('usher-team')} style={{ flexDirection: 'row', alignItems: 'center', padding: '16px', gap: '12px', background: 'white', border: '1px solid #E5E7EB' }}>
                    <div className="icon-bg" style={{ background: '#F3F4F6', color: '#4B5563', width: '40px', height: '40px' }}><Contact size={20} /></div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '2px' }}>Usher Team</h3>
                        <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>Manage Ushers</p>
                    </div>
                    <ArrowRight size={16} color="#9CA3AF" />
                </button>

                <button className="menu-card" onClick={() => onNavigate('member-manager')} style={{ flexDirection: 'row', alignItems: 'center', padding: '16px', gap: '12px', background: 'white', border: '1px solid #E5E7EB', gridColumn: '1 / -1' }}>
                    <div className="icon-bg" style={{ background: '#F3F4F6', color: '#4B5563', width: '40px', height: '40px' }}><Users size={20} /></div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '2px' }}>Congregation</h3>
                        <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>Manage Members DB</p>
                    </div>
                    <ArrowRight size={16} color="#9CA3AF" />
                </button>

                <button className="menu-card" onClick={() => onNavigate('login-history')} style={{ flexDirection: 'row', alignItems: 'center', padding: '16px', gap: '12px', background: 'white', border: '1px solid #E5E7EB', gridColumn: '1 / -1' }}>
                    <div className="icon-bg" style={{ background: '#FEF2F2', color: '#DC2626', width: '40px', height: '40px' }}><History size={20} /></div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '2px' }}>System Logs</h3>
                        <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>View Login History</p>
                    </div>
                    <ArrowRight size={16} color="#9CA3AF" />
                </button>

            </div>
        </div>
    )
}
