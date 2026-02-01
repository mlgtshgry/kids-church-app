import { CheckCircle } from 'lucide-react'

export default function ScanResultModal({ student, onClose }) {
    return (
        <div className="modal-overlay fade-in">
            <div className="modal-content" style={{ textAlign: 'center' }}>
                <div style={{ background: '#ECFDF5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={48} color="#10B981" />
                </div>
                <h2>Welcome Back!</h2>
                <p style={{ fontSize: '18px', margin: '8px 0 24px' }}><strong>{student.full_name}</strong> is marked present.</p>
                <button onClick={onClose} className="btn full-width" style={{ marginTop: '16px' }}>OK, Next</button>
            </div>
        </div>
    )
}
