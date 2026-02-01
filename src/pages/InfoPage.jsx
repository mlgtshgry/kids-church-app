import { ArrowLeft, Users, BookOpen, MessageSquare, Scan, ArrowUpDown, Trophy, AlertTriangle, QrCode } from 'lucide-react'

export default function InfoPage({ onBack }) {
    return (
        <div className="page slide-in">
            <header className="page-header">
                <button onClick={onBack} className="back-btn"><ArrowLeft size={24} /></button>
                <h2>Guidelines</h2>
            </header>

            <div style={{ padding: '0 8px' }}>
                <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="var(--primary)" /> New vs Regulars
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        <strong>New Kids:</strong> Any child who has visited less than 3 times. They get a special badge so you can welcome them!
                        <br /><br />
                        <strong>Regulars:</strong> Once a child visits for the 3rd time, they automatically become a "Regular".
                    </p>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #D97706' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                        <BookOpen size={20} /> Bible Verse & Notes
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        When marking attendance, tap the details:
                        <br /><br />
                        <strong style={{ color: '#D97706' }}><BookOpen size={14} style={{ display: 'inline', marginRight: 4 }} /> Bible Icon:</strong> Click this if the student can recite the Memory Verse for the day.
                        <br /><br />
                        <strong style={{ color: 'var(--primary)' }}><MessageSquare size={14} style={{ display: 'inline', marginRight: 4 }} /> Note Icon:</strong> Use this to add remarks (e.g. "Sick", "Fetched by Lola").
                    </p>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #10B981' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
                        <Scan size={20} /> Smart Check-in
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        <strong>Teachers:</strong> Tap the green <span style={{ fontWeight: 'bold', color: '#10B981' }}>SCAN</span> button on the Home Page and point at a student's QR.
                        <br /><br />
                        <strong>Students:</strong> Go to your Profile and tap the <QrCode size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> icon to see your code.
                    </p>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #8B5CF6' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6' }}>
                        <ArrowUpDown size={20} /> List Sorting
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        In the Student List, tap the <strong>Sort Button</strong> (top right) to toggle:
                        <br />
                        1. <strong>Present First</strong> (Green checks at top)
                        <br />
                        2. <strong>A-Z</strong> (Alphabetical)
                    </p>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #F59E0B' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
                        <Trophy size={20} /> Achievements
                    </h3>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        <p style={{ marginBottom: '12px' }}>Every medal has 3 Levels: <strong>Bronze</strong>, <strong>Silver</strong>, and <strong>Gold</strong>.</p>

                        <div style={{ marginBottom: '8px' }}>
                            <strong>🏆 Attendance</strong>
                            <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                                <li>1st Visit: First Step</li>
                                <li>3 Visits: Regular</li>
                                <li>10 Visits: <strong>Rising Star</strong> (Gold)</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <strong>📖 Bible Verses</strong>
                            <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                                <li>1 Verse: Student</li>
                                <li>5 Verses: Scholar</li>
                                <li>10 Verses: <strong>Bible Champ</strong> (Gold)</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <strong>🔥 Weekly Streak</strong>
                            <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                                <li>2 Weeks: Warming Up</li>
                                <li>4 Weeks: On Fire</li>
                                <li>8 Weeks: <strong>Unstoppable</strong> (Gold)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #DC2626' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
                        <AlertTriangle size={20} /> Follow Up
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                        The app monitors attendance automatically.
                        <br /><br />
                        If a student is <strong>absent for 3 consecutive Sundays</strong> (based on the last 3 recorded dates), they will appear in the "Follow Up" list so you can visit them.
                    </p>
                </div>
            </div>
        </div>
    )
}
