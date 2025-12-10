import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        {/* Redirect old routes */}
        <Route path="/admin-dashboard" element={<Navigate to="/" replace />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
