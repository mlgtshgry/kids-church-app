import { useState, useEffect } from 'react'
import { Scan, HelpCircle, Users, Activity, AlertTriangle, User, ClipboardList, Contact, LogOut, Shield } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import AttendanceChart from '../components/AttendanceChart'
import BirthdayCard from '../components/BirthdayCard'
import ScanResultModal from '../components/ScanResultModal'

export default function HomePage({ onNavigate }) {
    const { user, logout } = useAuth()
    const [showScanner, setShowScanner] = useState(false)
    const [scannedStudent, setScannedStudent] = useState(null)

    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);

            scanner.render(async (decodedText) => {
                try {
                    // Pause scanning
                    scanner.clear();
                    setShowScanner(false);

                    if (!supabase) return;

                    // 1. Fetch Student from ID
                    const { data, error } = await supabase.from('students').select('*').eq('id', decodedText).single();

                    if (error || !data) {
                        alert('Invalid QR Code or Student not found!');
                        return;
                    }

                    // 2. Mark Attendance
                    const today = new Date().toISOString().split('T')[0];
                    const { error: attError } = await supabase.from('attendance').upsert({
                        student_id: data.id,
                        date: today,
                        status: 'PRESENT'
                    }, { onConflict: 'student_id, date' });

                    if (attError) throw attError;

                    // 3. Show Success
                    setScannedStudent(data);

                } catch (err) {
                    console.error(err);
                    alert('Error marking attendance: ' + err.message);
                }
            }, (errorMessage) => {
                // console.log(errorMessage); // Ignore parse errors
            });

            return () => {
                try { scanner.clear() } catch (e) { }
            }
        }
    }, [showScanner])

    return (
        <div className="page fade-in">
            {scannedStudent && <ScanResultModal student={scannedStudent} onClose={() => setScannedStudent(null)} />}

            {showScanner && (
                <div className="modal-overlay" style={{ zIndex: 999 }}>
                    <div className="modal-content" style={{ padding: '20px', overflow: 'hidden' }}>
                        <button onClick={() => setShowScanner(false)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: '#F3F4F6', color: '#000', border: 'none', borderRadius: '50%', width: 32, height: 32 }}>X</button>
                        <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Scan QR Code</h3>
                        <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                        <p style={{ textAlign: 'center', color: '#6B7280', padding: '10px', fontSize: '13px' }}>Point camera at Student QR</p>
                    </div>
                </div>
            )}

            <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
                <div>
                    <h1>Hello, {user?.username || 'User'}!</h1>
                    <p style={{ fontSize: '12px', opacity: 0.8 }}>{user?.full_name}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowScanner(true)} style={{ background: '#10B981', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Scan size={20} /> <span style={{ fontSize: '12px', fontWeight: 'bold' }}>SCAN</span>
                    </button>
                    <button onClick={() => onNavigate('info')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <HelpCircle size={28} />
                    </button>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Logout">
                        <LogOut size={28} />
                    </button>
                </div>
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

                {user?.role === 'ADMIN' && (
                    <button className="menu-card" onClick={() => onNavigate('user-manager')}>
                        <div className="icon-bg" style={{ background: '#DBEAFE', color: '#2563EB' }}><Shield size={32} /></div>
                        <h3>Users</h3>
                        <p>Manage Staff</p>
                    </button>
                )}
            </div>
        </div>
    )
}
