import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

// Helper to get/create device ID
function getDeviceId() {
    let id = localStorage.getItem('virtual_device_id')
    if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('virtual_device_id', id)
    }
    return id
}

export default function Splash({ onFinish }) {
    useEffect(() => {
        // 1. Splash Timer
        const timer = setTimeout(onFinish, 2000)

        // 2. Device Logging (Fire and forget)
        const logDevice = async () => {
            try {
                const deviceId = getDeviceId()
                const userAgent = navigator.userAgent

                if (supabase) {
                    await supabase.from('device_logs').insert([
                        {
                            device_id: deviceId,
                            user_agent: userAgent
                        }
                    ])
                }
            } catch (err) {
                // Silent fail - don't block app
                console.warn('Logging failed:', err)
            }
        }

        logDevice()

        return () => clearTimeout(timer)
    }, [onFinish])

    const [showRes, setShowRes] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setShowRes(true), 5000)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <img
                    src={`${import.meta.env.BASE_URL}newlogo.png`}
                    alt="Logo"
                    className="splash-logo"
                    style={{ width: '120px', height: '120px', borderRadius: '20px', marginBottom: '16px', objectFit: 'cover' }}
                />
                <h1 className="splash-title">CityPraise</h1>
                <p className="splash-text">Connect</p>

                {showRes && (
                    <button
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        style={{ marginTop: '32px', padding: '8px 16px', background: 'transparent', border: '1px solid #fff', color: '#fff', borderRadius: '8px', cursor: 'pointer', opacity: 0.7 }}
                    >
                        Tap to Reset App
                    </button>
                )}
            </div>
        </div>
    )
}
