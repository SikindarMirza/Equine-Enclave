import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api')

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        // Store token and user info
        localStorage.setItem('admin-token', result.data.token)
        localStorage.setItem('admin-user', JSON.stringify(result.data.user))
        
        // Navigate to dashboard
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
      <div className="login-background">
        <div className="login-bg-shape login-bg-shape--1"></div>
        <div className="login-bg-shape login-bg-shape--2"></div>
        <div className="login-bg-shape login-bg-shape--3"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="login-logo__icon">🐴</span>
              <h1 className="login-logo__text">Equine Enclave</h1>
            </div>
            <p className="login-subtitle">Admin Dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <span className="login-error__icon">⚠️</span>
                <span className="login-error__text">{error}</span>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'login-button--loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-button__spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="login-button__arrow">→</span>
                </>
              )}
            </button>
          </form>

        </div>

        <div className="login-decoration">
          <div className="login-horse-silhouette"></div>
        </div>
      </div>
    </div>
  )
}

export default Login

