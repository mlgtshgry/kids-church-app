import { useState, useEffect, Component, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Splash from './components/Splash'

// Pages
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SuperAdminDashboard from './pages/SuperAdminDashboard' // Added
import AttendancePage from './pages/AttendancePage'
import ActivityLogPage from './pages/ActivityLogPage'
import FollowUpPage from './pages/FollowUpPage'
import StudentMonitorPage from './pages/StudentMonitorPage'
import ReportsPage from './pages/ReportsPage'
import InfoPage from './pages/InfoPage'
import StudentManager from './pages/StudentManager'
import UserManager from './pages/UserManager'
import UsherDashboard from './pages/UsherDashboard'
import ServiceAttendance from './pages/ServiceAttendance'
import LoginHistoryPage from './pages/LoginHistoryPage'

import MemberManager from './pages/MemberManager'

import './gamification.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    // Auto-fix: Clear session if it might be the cause
    if (error.toString().includes('user') || error.toString().includes('Auth')) {
      localStorage.removeItem('app_user')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#DC2626', fontFamily: 'system-ui', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p style={{ background: '#FEE2E2', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
            {this.state.error?.toString()}
          </p>
          <br /><br />
          <button
            onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{ padding: '12px 24px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
          >
            Reset & Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function AppRouter() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    if (!loading) {
      // splash delay handled in Splash
    }
  }, [loading])

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  if (showSplash) {
    return <Splash onFinish={handleSplashFinish} />
  }

  if (!user) {
    return <LoginPage />
  }

  // --- ROUTING LOGIC ---
  const isUsher = user.role === 'USHER' || user.role === 'USHER_ADMIN'
  const isSuperAdmin = user.role === 'SUPER_ADMIN'

  // If on home, redirect based on role
  if (currentPage === 'home') {
    if (isSuperAdmin) return <SuperAdminDashboard onNavigate={setCurrentPage} />
    if (isUsher) return <UsherDashboard onNavigate={setCurrentPage} />
  }

  switch (currentPage) {
    case 'home':
      // If we manually navigate to 'home', logic above handles it.
      // But if we want to force show Kids Dashboard for Super Admin:
      return <HomePage onNavigate={setCurrentPage} />

    case 'super-admin-dashboard':
      return <SuperAdminDashboard onNavigate={setCurrentPage} />

    case 'usher-dashboard':
      return <UsherDashboard onNavigate={setCurrentPage} />

    // KIDS ROUTES
    case 'attendance':
      return <AttendancePage onBack={() => setCurrentPage('home')} />
    case 'activity-log':
      return <ActivityLogPage onBack={() => setCurrentPage('home')} />
    case 'follow-up':
      return <FollowUpPage onBack={() => setCurrentPage('home')} />
    case 'student-monitor':  // Profiles
      return <StudentMonitorPage onBack={() => setCurrentPage('home')} />
    case 'reports':
      return <ReportsPage onNavigate={setCurrentPage} />
    case 'info':
      return <InfoPage onBack={() => setCurrentPage('home')} />
    case 'student-manager':
      return <StudentManager onBack={() => setCurrentPage('home')} />

    // SHARED / ADMIN ROUTES
    case 'user-manager':
    case 'kids-staff':
      return <UserManager key="kids-mgr" onBack={() => setCurrentPage('home')} initialTab="KIDS" lockedTab="KIDS" />
    case 'usher-team':
      return <UserManager key="usher-mgr" onBack={() => setCurrentPage('home')} initialTab="USHERS" lockedTab="USHERS" />
    case 'login-history':
      return <LoginHistoryPage onBack={() => setCurrentPage('user-manager')} />

    // USHER ROUTES (New)
    case 'service-attendance':
      return <ServiceAttendance onBack={() => setCurrentPage('home')} />
    case 'member-manager':
      return <MemberManager onBack={() => setCurrentPage('home')} />
    case 'member-reports':
      return <div style={{ padding: 20 }}>Member Reports (Coming Soon) <button onClick={() => setCurrentPage('home')}>Back</button></div>

    default:
      return <HomePage onNavigate={setCurrentPage} />
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}
