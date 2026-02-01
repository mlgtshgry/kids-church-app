import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for persisted session
        const persistedUser = localStorage.getItem('app_user')
        if (persistedUser) {
            try {
                setUser(JSON.parse(persistedUser))
            } catch (e) {
                console.error('Invalid session data', e)
                localStorage.removeItem('app_user')
            }
        }
        setLoading(false)
    }, [])

    const login = async (pin, rememberMe) => {
        try {
            if (!supabase) throw new Error('Supabase not connected')

            // 1. Check PIN against app_users table
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('pin', pin)
                .single()

            if (error || !data) {
                throw new Error('Invalid PIN')
            }

            // 2. Set User Session
            const userSession = {
                id: data.id,
                username: data.username,
                role: data.role,
                full_name: data.full_name
            }

            setUser(userSession)

            // 3. Handle Persistence
            if (rememberMe) {
                localStorage.setItem('app_user', JSON.stringify(userSession))
            } else {
                localStorage.removeItem('app_user')
            }

            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('app_user')
    }

    // Helper permissions
    const canEditStudents = user && (user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'ASSISTANT_TEACHER')
    const canDeleteStudents = user && (user.role === 'ADMIN')
    const canUnlockAttendance = user && (user.role === 'ADMIN' || user.role === 'TEACHER')

    const value = {
        user,
        loading,
        login,
        logout,
        permissions: {
            canEditStudents,
            canDeleteStudents,
            canUnlockAttendance
        }
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
