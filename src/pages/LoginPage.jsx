import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, AlertTriangle, User, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const { login, loading } = useAuth()

    const [selectedUser, setSelectedUser] = useState(null) // 'admin', 'teacher', 'assistant' (This is just UI selection, we use the PIN to actually auth)
    // BETTER APPROACH for PIN: Just ask for PIN, or Filter by User?
    // The plan said "Select User or Type Username".
    // Let's make it simple: Tap a Role/User Tile, then enter PIN.

    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    // Mock Users for Selection (We don't expose PINs here obviously)
    const users = [
        { id: 'admin', label: 'Admin', icon: <Lock size={24} />, color: '#DC2626' },
        { id: 'teacher', label: 'Teacher', icon: <User size={24} />, color: '#2563EB' },
        { id: 'assistant', label: 'Assistant', icon: <User size={24} />, color: '#10B981' },
    ] // We map these to the actual DB usernames: 'admin', 'teacher', 'assistant' (from sql)

    const handleNumClick = (num) => {
        if (pin.length < 6) setPin(prev => prev + num)
        setError('')
    }

    const handleBackspace = () => setPin(prev => prev.slice(0, -1))
    const handleClear = () => setPin('')

    const handleLogin = async () => {
        if (!pin) return
        setIsLoggingIn(true)
        setError('')

        // We pass the PIN to the context. The Context checks the DB.
        // Note: In a real multi-user app we'd pass username + pin.
        // But since our PINs are unique enough for this kiosk, OR we can pass the username from the selection.
        // Let's try to just pass the PIN first (if uniqueness is guaranteed), OR pass both.
        // My Context `login` function currently takes `pin` (and queries by pin). 
        // This assumes PINs are unique across users.

        const result = await login(pin, rememberMe)

        if (!result.success) {
            setError(result.error || 'Invalid PIN')
            setPin('')
        }
        setIsLoggingIn(false)
    }

    return (
        <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F3F4F6' }}>

            <div className="card" style={{ padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <img
                    src={`${import.meta.env.BASE_URL}newlogo.png`}
                    alt="Logo"
                    style={{ width: '80px', height: '80px', borderRadius: '16px', marginBottom: '8px', objectFit: 'cover' }}
                />
                <h2 style={{ marginBottom: '24px', color: '#1F2937' }}>Login</h2>

                {/* User Selection (Optional Visual Aid - not strictly needed if unique PINs, but good for UX) */}
                {/* For simplicity in V1, let's just show "Enter PIN" */}

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ background: '#F9FAFB', border: '2px solid #E5E7EB', borderRadius: '12px', padding: '16px', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                        {pin ? '*'.repeat(pin.length) : <span style={{ color: '#9CA3AF', fontSize: '16px', letterSpacing: 'normal', fontWeight: 'normal' }}>Enter PIN</span>}
                    </div>
                    {error && <div style={{ color: '#DC2626', fontSize: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><AlertTriangle size={14} /> {error}</div>}
                </div>

                {/* PIN Pad */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleNumClick(num)} className="btn secondary" style={{ fontSize: '20px', padding: '16px' }}>{num}</button>
                    ))}
                    <button onClick={handleClear} className="btn secondary" style={{ fontSize: '14px', padding: '16px', color: '#EF4444' }}>C</button>
                    <button onClick={() => handleNumClick(0)} className="btn secondary" style={{ fontSize: '20px', padding: '16px' }}>0</button>
                    <button onClick={handleBackspace} className="btn secondary" style={{ fontSize: '14px', padding: '16px' }}>⌫</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="remember" style={{ fontSize: '14px', color: '#4B5563', cursor: 'pointer' }}>Keep me signed in</label>
                </div>

                <button
                    className="btn full-width"
                    onClick={handleLogin}
                    disabled={isLoggingIn || pin.length < 4}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    {isLoggingIn ? 'Verifying...' : 'Login'} <ArrowRight size={20} />
                </button>

                <p style={{ marginTop: '24px', fontSize: '12px', color: '#9CA3AF' }}>
                    Default PINs: Admin 1234, Teacher 1111, Asst 2222
                </p>

            </div>
        </div>
    )
}
