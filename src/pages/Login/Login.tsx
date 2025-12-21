import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api')

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      document.documentElement.style.setProperty('--mouse-x', `${x}px`)
      document.documentElement.style.setProperty('--mouse-y', `${y}px`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('admin-token', result.data.token)
        localStorage.setItem('admin-user', JSON.stringify(result.data.user))
        navigate('/')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="login-bg__gradient"></div>
        <div className="login-bg__noise"></div>
        <div className="login-bg__glow login-bg__glow--1"></div>
        <div className="login-bg__glow login-bg__glow--2"></div>
        <div className="login-bg__glow login-bg__glow--3"></div>
        
        {/* Floating particles */}
        <div className="login-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="login-particle" style={{
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${15 + Math.random() * 10}s`,
              '--x': `${Math.random() * 100}%`,
              '--size': `${2 + Math.random() * 4}px`,
            } as React.CSSProperties}></div>
          ))}
        </div>

        {/* Animated horses */}
        <div className="login-horses">
          <div className="login-horse login-horse--1"></div>
          <div className="login-horse login-horse--2"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="login-content">
        {/* Left side - Branding */}
        <div className="login-branding">
          <div className="login-branding__inner">
            <div className="login-brand-icon">
              <img src="/logo.png" alt="Equine Enclave Logo" className="login-brand-logo" />
            </div>
            <h1 className="login-brand-title">
              <span className="login-brand-title__line">Equine</span>
              <span className="login-brand-title__line login-brand-title__line--accent">Enclave</span>
            </h1>
            <p className="login-brand-tagline">Ride like a pro</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="login-form-container">
          <div className="login-card">
            <div className="login-card__glow"></div>
            
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your admin account</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="login-error">
                  <div className="login-error__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <span className="login-error__text">{error}</span>
                </div>
              )}

              <div className={`login-field ${focusedField === 'username' ? 'login-field--focused' : ''} ${username ? 'login-field--filled' : ''}`}>
                <label htmlFor="username" className="login-label">Username</label>
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  <div className="login-input-line"></div>
                </div>
              </div>

              <div className={`login-field ${focusedField === 'password' ? 'login-field--focused' : ''} ${password ? 'login-field--filled' : ''}`}>
                <label htmlFor="password" className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <div className="login-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                  <div className="login-input-line"></div>
                </div>
              </div>

              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'login-button--loading' : ''}`}
                disabled={isLoading}
              >
                <span className="login-button__bg"></span>
                <span className="login-button__content">
                  {isLoading ? (
                    <>
                      <span className="login-button__spinner"></span>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="login-button__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="login-footer">
              <div className="login-footer__divider">
                <span>Secure Admin Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
