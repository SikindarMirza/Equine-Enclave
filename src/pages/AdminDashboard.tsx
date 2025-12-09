import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001/api'

interface StatCard {
  title: string
  value: string | number
  change: string
  icon: string
  trend: 'up' | 'down' | 'neutral'
}

interface Booking {
  id: number
  client: string
  service: string
  date: string
  status: 'confirmed' | 'pending' | 'completed'
}

interface Horse {
  id: number
  name: string
  breed: string
  age: number
  color: string
  stall: string
  status: 'healthy' | 'attention' | 'treatment'
  lastCheckup: string
  notes: string
}

interface ClassEntry {
  rideNumber: number
  timestamp: string
}

interface Rider {
  id: string
  _id?: string
  name: string
  age: number
  phone: string
  email: string
  activeClasses: ClassEntry[]
  activeClassesCount: number
  level: 'beginner' | 'intermediate' | 'advanced'
  joinedDate: string
  feesPaid: boolean
  batchType?: 'morning' | 'evening'
  batchIndex?: number
}

interface Batch {
  _id?: string
  name: string
  time: string
  batchIndex?: number
  riders: Rider[]
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedBatches, setExpandedBatches] = useState<string[]>(['morning-batch1', 'evening-batch1'])
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; rider: Rider | null; batchType: 'morning' | 'evening'; batchIndex: number }>({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  const [riderFilter, setRiderFilter] = useState<'all' | 'payment-due' | 'all-details'>('all')
  const [editBatchModal, setEditBatchModal] = useState<{
    isOpen: boolean;
    batchType: 'morning' | 'evening';
    batchIndex: number;
    name: string;
    time: string;
  }>({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })
  const [assignBatchModal, setAssignBatchModal] = useState<{ 
    isOpen: boolean; 
    rider: Rider | null; 
    sourceBatchType: 'morning' | 'evening'; 
    sourceBatchIndex: number 
  }>({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0 })
  
  const [addRiderModal, setAddRiderModal] = useState(false)
  const [checkinModal, setCheckinModal] = useState<{
    isOpen: boolean;
    rider: Rider | null;
    batchType: 'morning' | 'evening';
    batchIndex: number;
  }>({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    rider: Rider | null;
    batchType: 'morning' | 'evening';
    batchIndex: number;
  }>({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  
  const [editRiderModal, setEditRiderModal] = useState<{
    isOpen: boolean;
    rider: Rider | null;
    batchType: 'morning' | 'evening';
    batchIndex: number;
  }>({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  
  const [editRiderData, setEditRiderData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })
  const [newRider, setNewRider] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    batchType: 'morning' as 'morning' | 'evening',
    batchIndex: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to open edit batch modal
  const openEditBatchModal = (batchType: 'morning' | 'evening', batchIndex: number, name: string, time: string) => {
    setEditBatchModal({
      isOpen: true,
      batchType,
      batchIndex,
      name,
      time
    })
  }

  // Function to save batch timing
  const handleSaveBatchTiming = async () => {
    const { batchType, batchIndex, name, time } = editBatchModal
    
    try {
      const response = await fetch(`${API_BASE_URL}/batches/by-type/${batchType}/${batchIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, time })
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })
      } else {
        alert(result.message || 'Failed to update batch timing')
      }
    } catch (err) {
      console.error('Error updating batch timing:', err)
      alert('Failed to update batch timing')
    }
  }

  // Fetch batches from API
  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/riders/batches`)
      const result = await response.json()
      
      if (result.success) {
        setMorningBatches(result.data.morning)
        setEveningBatches(result.data.evening)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to fetch riders data')
      console.error('Error fetching batches:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchBatches()
  }, [])

  const stats: StatCard[] = [
    { title: 'Total Horses', value: 8, change: '+1 this month', icon: '🐴', trend: 'up' },
    { title: 'Active Bookings', value: 23, change: '+5 this week', icon: '📅', trend: 'up' },
    { title: 'Revenue (MTD)', value: '$34,250', change: '+12% vs last month', icon: '💰', trend: 'up' },
    { title: 'Lesson Hours', value: 156, change: '-3% vs last month', icon: '📚', trend: 'down' },
  ]

  const recentBookings: Booking[] = [
    { id: 1, client: 'Sarah Mitchell', service: 'Private Lesson', date: '2025-12-10', status: 'confirmed' },
    { id: 2, client: 'John Peterson', service: 'Horse Boarding', date: '2025-12-09', status: 'pending' },
    { id: 3, client: 'Emily Chen', service: 'Trail Ride', date: '2025-12-11', status: 'confirmed' },
    { id: 4, client: 'Michael Brown', service: 'Training Session', date: '2025-12-09', status: 'completed' },
    { id: 5, client: 'Lisa Anderson', service: 'Group Lesson', date: '2025-12-12', status: 'pending' },
  ]

  const horses: Horse[] = [
    { id: 1, name: 'Alishan', breed: 'Arabian', age: 7, color: 'Bay', stall: 'A-01', status: 'healthy', lastCheckup: '2025-12-01', notes: 'Excellent condition, very energetic' },
    { id: 2, name: 'Aslan', breed: 'Thoroughbred', age: 5, color: 'Chestnut', stall: 'A-02', status: 'healthy', lastCheckup: '2025-11-28', notes: 'Great for training sessions' },
    { id: 3, name: 'Timur', breed: 'Akhal-Teke', age: 8, color: 'Golden', stall: 'A-03', status: 'healthy', lastCheckup: '2025-12-05', notes: 'Show horse, competition ready' },
    { id: 4, name: 'Heera', breed: 'Marwari', age: 6, color: 'White', stall: 'B-01', status: 'attention', lastCheckup: '2025-12-08', notes: 'Minor leg strain, light exercise only' },
    { id: 5, name: 'Clara', breed: 'Hanoverian', age: 4, color: 'Black', stall: 'B-02', status: 'healthy', lastCheckup: '2025-12-03', notes: 'Young and spirited, great potential' },
    { id: 6, name: 'XLove', breed: 'Dutch Warmblood', age: 9, color: 'Dark Bay', stall: 'B-03', status: 'healthy', lastCheckup: '2025-11-30', notes: 'Experienced jumper, calm temperament' },
    { id: 7, name: 'Baadshah', breed: 'Friesian', age: 10, color: 'Black', stall: 'C-01', status: 'treatment', lastCheckup: '2025-12-09', notes: 'Recovering from cold, on medication' },
    { id: 8, name: 'Antilope', breed: 'Lusitano', age: 6, color: 'Grey', stall: 'C-02', status: 'healthy', lastCheckup: '2025-12-02', notes: 'Dressage specialist, very graceful' },
  ]

  const [morningBatches, setMorningBatches] = useState<Batch[]>([])

  const [eveningBatches, setEveningBatches] = useState<Batch[]>([])

  // Helper function to check if rider needs to pay (activeClassesCount >= 26)
  const needsToPay = (rider: Rider) => rider.activeClassesCount >= 26

  // Helper function to format date as "MonYYYY" (e.g., "Mar2024", "Sept2025")
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${month}${year}`
  }

  // Get all riders with their batch info
  const getAllRidersWithBatchInfo = () => {
    const allRiders: Array<{
      rider: Rider;
      batchType: 'morning' | 'evening';
      batchIndex: number;
      batchName: string;
      batchTime: string;
    }> = []

    morningBatches.forEach((batch, idx) => {
      batch.riders.forEach(rider => {
        allRiders.push({
          rider,
          batchType: 'morning',
          batchIndex: idx,
          batchName: batch.name,
          batchTime: batch.time
        })
      })
    })

    eveningBatches.forEach((batch, idx) => {
      batch.riders.forEach(rider => {
        allRiders.push({
          rider,
          batchType: 'evening',
          batchIndex: idx,
          batchName: batch.name,
          batchTime: batch.time
        })
      })
    })

    return allRiders
  }

  // Delete a rider
  const handleDeleteRider = async () => {
    if (!deleteModal.rider) return
    
    const riderId = deleteModal.rider.id
    
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
      } else {
        alert(result.message || 'Failed to delete rider')
      }
    } catch (err) {
      console.error('Error deleting rider:', err)
      alert('Failed to delete rider')
    }
    
    setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  }

  // Open edit modal with rider data
  const openEditModal = (rider: Rider, batchType: 'morning' | 'evening', batchIndex: number) => {
    setEditRiderData({
      name: rider.name,
      age: rider.age.toString(),
      phone: rider.phone,
      email: rider.email,
      level: rider.level
    })
    setEditRiderModal({ isOpen: true, rider, batchType, batchIndex })
  }

  // Save edited rider
  const handleSaveEdit = async () => {
    if (!editRiderModal.rider) return
    
    const riderId = editRiderModal.rider.id
    
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editRiderData.name,
          age: parseInt(editRiderData.age),
          phone: editRiderData.phone,
          email: editRiderData.email,
          level: editRiderData.level
        })
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
      } else {
        alert(result.message || 'Failed to update rider')
      }
    } catch (err) {
      console.error('Error updating rider:', err)
      alert('Failed to update rider')
    }
    
    setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  }

  // Filter riders based on selected filter
  const filterRiders = (riders: Rider[]) => {
    if (riderFilter === 'payment-due') {
      return riders.filter(rider => needsToPay(rider))
    }
    return riders
  }

  // Get count of riders with payment due
  const getPaymentDueCount = () => {
    const morningDue = morningBatches.reduce((acc, batch) => 
      acc + batch.riders.filter(r => needsToPay(r)).length, 0)
    const eveningDue = eveningBatches.reduce((acc, batch) => 
      acc + batch.riders.filter(r => needsToPay(r)).length, 0)
    return morningDue + eveningDue
  }

  // Function to handle payment and deduct 26 classes
  const handlePayment = async () => {
    if (!paymentModal.rider) return
    
    const riderId = paymentModal.rider.id
    
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}/pay`, {
        method: 'PATCH'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
      } else {
        alert(result.message || 'Failed to process payment')
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      alert('Failed to process payment')
    }
    
    setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  }

  // Function to move rider to a different batch
  const handleMoveToBatch = async (targetBatchType: 'morning' | 'evening', targetBatchIndex: number) => {
    if (!assignBatchModal.rider) return
    
    const rider = assignBatchModal.rider
    const { sourceBatchType, sourceBatchIndex } = assignBatchModal
    
    // Don't do anything if moving to the same batch
    if (sourceBatchType === targetBatchType && sourceBatchIndex === targetBatchIndex) {
      setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0 })
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${rider.id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetBatchType,
          targetBatchIndex
        })
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
      } else {
        alert(result.message || 'Failed to move rider')
      }
    } catch (err) {
      console.error('Error moving rider:', err)
      alert('Failed to move rider')
    }
    
    setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0 })
  }

  // Function to add a new rider
  const handleAddRider = async () => {
    if (!newRider.name || !newRider.age || !newRider.phone) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/riders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRider.name,
          age: parseInt(newRider.age),
          phone: newRider.phone,
          email: newRider.email,
          level: newRider.level,
          batchType: newRider.batchType,
          batchIndex: newRider.batchIndex
        })
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        // Reset form and close modal
        setNewRider({
          name: '',
          age: '',
          phone: '',
          email: '',
          level: 'beginner',
          batchType: 'morning',
          batchIndex: 0
        })
        setAddRiderModal(false)
      } else {
        alert(result.message || 'Failed to add rider')
      }
    } catch (err) {
      console.error('Error adding rider:', err)
      alert('Failed to add rider')
    }
  }

  // Function to handle check-in (increment active classes)
  const handleCheckin = async () => {
    if (!checkinModal.rider) return
    
    const riderId = checkinModal.rider.id
    
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}/checkin`, {
        method: 'PATCH'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
      } else {
        alert(result.message || 'Failed to check in rider')
      }
    } catch (err) {
      console.error('Error checking in rider:', err)
      alert('Failed to check in rider')
    }
    
    setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
  }

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    )
  }

  const getTotalRiders = () => {
    const morningTotal = morningBatches.reduce((acc, batch) => acc + batch.riders.length, 0)
    const eveningTotal = eveningBatches.reduce((acc, batch) => acc + batch.riders.length, 0)
    return morningTotal + eveningTotal
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'horses': return 'Horses'
      case 'bookings': return 'Bookings'
      case 'riders': return 'Riders'
      case 'staff': return 'Staff'
      case 'reports': return 'Reports'
      case 'settings': return 'Settings'
      default: return 'Dashboard'
    }
  }

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'horses': return 'Manage all horses at Equine Enclave'
      case 'bookings': return 'View and manage all bookings'
      case 'riders': return 'Manage riders across morning and evening batches'
      case 'staff': return 'Staff management'
      case 'reports': return 'Analytics and reports'
      case 'settings': return 'System settings'
      default: return "Welcome back! Here's what's happening today."
    }
  }

  const renderOverview = () => (
    <>
      {/* Stats Grid */}
      <div className="admin__stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card__icon">{stat.icon}</div>
            <div className="stat-card__content">
              <span className="stat-card__title">{stat.title}</span>
              <span className="stat-card__value">{stat.value}</span>
              <span className={`stat-card__change stat-card__change--${stat.trend}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="admin__content">
        {/* Recent Bookings */}
        <section className="admin__card admin__card--bookings">
          <div className="admin__card-header">
            <h2 className="admin__card-title">Recent Bookings</h2>
            <button className="admin__card-action" onClick={() => setActiveTab('bookings')}>View All →</button>
          </div>
          <div className="admin__table-wrapper">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.client}</td>
                    <td>{booking.service}</td>
                    <td>{booking.date}</td>
                    <td>
                      <span className={`status-badge status-badge--${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Horse Status */}
        <section className="admin__card admin__card--horses">
          <div className="admin__card-header">
            <h2 className="admin__card-title">Horse Status</h2>
            <button className="admin__card-action" onClick={() => setActiveTab('horses')}>Manage →</button>
          </div>
          <div className="admin__horse-list">
            {horses.slice(0, 5).map((horse) => (
              <div key={horse.id} className="horse-item">
                <div className="horse-item__avatar">🐴</div>
                <div className="horse-item__info">
                  <span className="horse-item__name">{horse.name}</span>
                  <span className="horse-item__details">
                    {horse.breed} • Stall {horse.stall}
                  </span>
                </div>
                <span className={`status-dot status-dot--${horse.status}`}></span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="admin__card admin__card--actions">
          <div className="admin__card-header">
            <h2 className="admin__card-title">Quick Actions</h2>
          </div>
          <div className="admin__quick-actions">
            <button className="quick-action">
              <span className="quick-action__icon">➕</span>
              <span className="quick-action__label">New Booking</span>
            </button>
            <button className="quick-action" onClick={() => setActiveTab('horses')}>
              <span className="quick-action__icon">🐴</span>
              <span className="quick-action__label">Add Horse</span>
            </button>
            <button className="quick-action" onClick={() => setActiveTab('riders')}>
              <span className="quick-action__icon">🏇</span>
              <span className="quick-action__label">Add Rider</span>
            </button>
            <button className="quick-action">
              <span className="quick-action__icon">📋</span>
              <span className="quick-action__label">Generate Report</span>
            </button>
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="admin__card admin__card--schedule">
          <div className="admin__card-header">
            <h2 className="admin__card-title">Today's Schedule</h2>
            <span className="admin__card-date">Dec 9, 2025</span>
          </div>
          <div className="admin__schedule">
            <div className="schedule-item">
              <span className="schedule-item__time">8:00 AM</span>
              <div className="schedule-item__content">
                <span className="schedule-item__title">Morning Feed & Turnout</span>
                <span className="schedule-item__meta">All stables</span>
              </div>
            </div>
            <div className="schedule-item">
              <span className="schedule-item__time">9:30 AM</span>
              <div className="schedule-item__content">
                <span className="schedule-item__title">Private Lesson - Sarah M.</span>
                <span className="schedule-item__meta">Arena A • Alishan</span>
              </div>
            </div>
            <div className="schedule-item">
              <span className="schedule-item__time">11:00 AM</span>
              <div className="schedule-item__content">
                <span className="schedule-item__title">Group Lesson (Beginners)</span>
                <span className="schedule-item__meta">Arena B • 4 riders</span>
              </div>
            </div>
            <div className="schedule-item">
              <span className="schedule-item__time">2:00 PM</span>
              <div className="schedule-item__content">
                <span className="schedule-item__title">Vet Visit - Baadshah</span>
                <span className="schedule-item__meta">Stall C-01 • Follow-up</span>
              </div>
            </div>
            <div className="schedule-item">
              <span className="schedule-item__time">4:00 PM</span>
              <div className="schedule-item__content">
                <span className="schedule-item__title">Trail Ride Group</span>
                <span className="schedule-item__meta">Forest Trail • 6 riders</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )

  const renderHorses = () => (
    <div className="horses-page">
      {/* Horse Stats */}
      <div className="horses-stats">
        <div className="horses-stat">
          <span className="horses-stat__value">{horses.length}</span>
          <span className="horses-stat__label">Total Horses</span>
        </div>
        <div className="horses-stat horses-stat--healthy">
          <span className="horses-stat__value">{horses.filter(h => h.status === 'healthy').length}</span>
          <span className="horses-stat__label">Healthy</span>
        </div>
        <div className="horses-stat horses-stat--attention">
          <span className="horses-stat__value">{horses.filter(h => h.status === 'attention').length}</span>
          <span className="horses-stat__label">Need Attention</span>
        </div>
        <div className="horses-stat horses-stat--treatment">
          <span className="horses-stat__value">{horses.filter(h => h.status === 'treatment').length}</span>
          <span className="horses-stat__label">In Treatment</span>
        </div>
      </div>

      {/* Horse Grid */}
      <div className="horses-grid">
        {horses.map((horse) => (
          <div key={horse.id} className="horse-card">
            <div className="horse-card__header">
              <div className="horse-card__avatar">
                <span>🐴</span>
              </div>
              <div className="horse-card__title">
                <h3 className="horse-card__name">{horse.name}</h3>
                <span className="horse-card__breed">{horse.breed}</span>
              </div>
              <span className={`status-indicator status-indicator--${horse.status}`}>
                {horse.status}
              </span>
            </div>
            
            <div className="horse-card__details">
              <div className="horse-card__detail">
                <span className="horse-card__detail-label">Age</span>
                <span className="horse-card__detail-value">{horse.age} years</span>
              </div>
              <div className="horse-card__detail">
                <span className="horse-card__detail-label">Color</span>
                <span className="horse-card__detail-value">{horse.color}</span>
              </div>
              <div className="horse-card__detail">
                <span className="horse-card__detail-label">Stall</span>
                <span className="horse-card__detail-value">{horse.stall}</span>
              </div>
              <div className="horse-card__detail">
                <span className="horse-card__detail-label">Last Checkup</span>
                <span className="horse-card__detail-value">{horse.lastCheckup}</span>
              </div>
            </div>

            <div className="horse-card__notes">
              <span className="horse-card__notes-label">Notes</span>
              <p className="horse-card__notes-text">{horse.notes}</p>
            </div>

            <div className="horse-card__actions">
              <button className="horse-card__btn horse-card__btn--primary">View Profile</button>
              <button className="horse-card__btn horse-card__btn--secondary">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Horse Button */}
      <button className="add-horse-btn">
        <span>➕</span>
        Add New Horse
      </button>
    </div>
  )

  const renderRiders = () => (
    <div className="riders-page">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading riders...</div>
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchBatches}>Retry</button>
        </div>
      )}
      {/* Riders Stats */}
      <div className="riders-stats">
        <div className="riders-stat">
          <span className="riders-stat__value">{getTotalRiders()}</span>
          <span className="riders-stat__label">Total Riders</span>
        </div>
        <div className="riders-stat riders-stat--morning">
          <span className="riders-stat__value">{morningBatches.reduce((acc, b) => acc + b.riders.length, 0)}</span>
          <span className="riders-stat__label">Morning Batch</span>
        </div>
        <div className="riders-stat riders-stat--evening">
          <span className="riders-stat__value">{eveningBatches.reduce((acc, b) => acc + b.riders.length, 0)}</span>
          <span className="riders-stat__label">Evening Batch</span>
        </div>
      </div>

      {/* Filters */}
      <div className="riders-filters">
        <span className="riders-filters__label">Filter:</span>
        <div className="riders-filters__buttons">
          <button 
            className={`filter-btn ${riderFilter === 'all' ? 'filter-btn--active' : ''}`}
            onClick={() => setRiderFilter('all')}
          >
            All Riders
          </button>
          <button 
            className={`filter-btn ${riderFilter === 'payment-due' ? 'filter-btn--active' : ''}`}
            onClick={() => setRiderFilter('payment-due')}
          >
            Payment Due ({getPaymentDueCount()})
          </button>
          <button 
            className={`filter-btn ${riderFilter === 'all-details' ? 'filter-btn--active' : ''}`}
            onClick={() => setRiderFilter('all-details')}
          >
            Show All Rider Details
          </button>
        </div>
      </div>

      {/* All Rider Details View */}
      {riderFilter === 'all-details' && (
        <div className="all-riders-section">
          <div className="all-riders-header">
            <h3 className="all-riders-title">📋 All Rider Details</h3>
            <span className="all-riders-count">{getAllRidersWithBatchInfo().length} riders</span>
          </div>
          <div className="all-riders-table-wrapper">
            <table className="all-riders-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Batch</th>
                  <th>Joining Date</th>
                  <th>Mobile Number</th>
                  <th>Email Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getAllRidersWithBatchInfo().map(({ rider, batchType, batchIndex, batchName }) => (
                  <tr key={rider.id}>
                    <td>
                      <div className="rider-name">
                        <span className="rider-avatar">🏇</span>
                        {rider.name}
                      </div>
                    </td>
                    <td>{rider.age} yrs</td>
                    <td>
                      <span className="batch-tag">
                        {batchType === 'morning' ? '🌅' : '🌆'} {batchType.charAt(0).toUpperCase() + batchType.slice(1)} - {batchName}
                      </span>
                    </td>
                    <td>
                      <span className="joining-date" title={rider.joinedDate}>
                        {formatJoinedDate(rider.joinedDate)}
                      </span>
                    </td>
                    <td>{rider.phone}</td>
                    <td>{rider.email || '-'}</td>
                    <td>
                      <div className="rider-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => openEditModal(rider, batchType, batchIndex)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => setDeleteModal({ isOpen: true, rider, batchType, batchIndex })}
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Morning and Evening Batches - hidden when showing all details */}
      {riderFilter !== 'all-details' && (
      <>
      {/* Morning Batches */}
      <div className="batch-section">
        <div className="batch-section__header">
          <span className="batch-section__icon">🌅</span>
          <h2 className="batch-section__title">Morning Batches</h2>
          <span className="batch-section__count">{morningBatches.length} batches</span>
        </div>

        <div className="batches-container">
          {morningBatches.map((batch, index) => {
            const batchId = `morning-batch${index + 1}`
            const isExpanded = expandedBatches.includes(batchId)
            return (
              <div key={batchId} className={`batch-card ${isExpanded ? 'batch-card--expanded' : ''}`}>
                <div className="batch-card__header">
                  <div className="batch-card__info" onClick={() => toggleBatch(batchId)}>
                    <h3 className="batch-card__name">{batch.name}</h3>
                    <span className="batch-card__time">⏰ {batch.time}</span>
                  </div>
                  <div className="batch-card__meta">
                    <button 
                      className="batch-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditBatchModal('morning', index, batch.name, batch.time)
                      }}
                      title="Edit batch timing"
                    >
                      ✏️
                    </button>
                    <span className="batch-card__rider-count" onClick={() => toggleBatch(batchId)}>
                      {filterRiders(batch.riders).length} riders
                      {riderFilter === 'payment-due' && filterRiders(batch.riders).length !== batch.riders.length && 
                        ` (of ${batch.riders.length})`
                      }
                    </span>
                    <span className={`batch-card__toggle ${isExpanded ? 'batch-card__toggle--open' : ''}`} onClick={() => toggleBatch(batchId)}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="batch-card__content">
                    {filterRiders(batch.riders).length === 0 ? (
                      <div className="no-riders-message">
                        No riders with payment due in this batch
                      </div>
                    ) : (
                      <table className="riders-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Active Classes</th>
                            <th>Level</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterRiders(batch.riders).map((rider) => (
                            <tr key={rider.id}>
                              <td>
                                <div className="rider-name">
                                  <span className="rider-avatar">🏇</span>
                                  {rider.name}
                                </div>
                              </td>
                              <td>{rider.age} yrs</td>
                              <td>
                                <span className={`active-classes ${needsToPay(rider) ? 'active-classes--warning' : ''}`}>
                                  {rider.activeClassesCount} classes
                                </span>
                              </td>
                              <td>
                                <span className={`level-badge level-badge--${rider.level}`}>
                                  {rider.level}
                                </span>
                              </td>
                              <td title={rider.joinedDate}>{formatJoinedDate(rider.joinedDate)}</td>
                              <td>
                                <div className="rider-actions">
                                  <button 
                                    className="checkin-btn"
                                    onClick={() => setCheckinModal({ isOpen: true, rider, batchType: 'morning', batchIndex: index })}
                                    title="Check-in"
                                  >
                                    Check-in
                                  </button>
                                  <button 
                                    className="assign-btn"
                                    onClick={() => setAssignBatchModal({ isOpen: true, rider, sourceBatchType: 'morning', sourceBatchIndex: index })}
                                    title="Assign to Batch"
                                  >
                                    Move
                                  </button>
                                  <button 
                                    className={`pay-btn ${needsToPay(rider) ? 'pay-btn--unpaid' : 'pay-btn--paid'}`}
                                    onClick={() => setPaymentModal({ isOpen: true, rider, batchType: 'morning', batchIndex: index })}
                                    disabled={!needsToPay(rider)}
                                  >
                                    {needsToPay(rider) ? 'Pay' : 'Paid ✓'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Evening Batches */}
      <div className="batch-section">
        <div className="batch-section__header">
          <span className="batch-section__icon">🌆</span>
          <h2 className="batch-section__title">Evening Batches</h2>
          <span className="batch-section__count">{eveningBatches.length} batches</span>
        </div>

        <div className="batches-container">
          {eveningBatches.map((batch, index) => {
            const batchId = `evening-batch${index + 1}`
            const isExpanded = expandedBatches.includes(batchId)
            return (
              <div key={batchId} className={`batch-card ${isExpanded ? 'batch-card--expanded' : ''}`}>
                <div className="batch-card__header">
                  <div className="batch-card__info" onClick={() => toggleBatch(batchId)}>
                    <h3 className="batch-card__name">{batch.name}</h3>
                    <span className="batch-card__time">⏰ {batch.time}</span>
                  </div>
                  <div className="batch-card__meta">
                    <button 
                      className="batch-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditBatchModal('evening', index, batch.name, batch.time)
                      }}
                      title="Edit batch timing"
                    >
                      ✏️
                    </button>
                    <span className="batch-card__rider-count" onClick={() => toggleBatch(batchId)}>
                      {filterRiders(batch.riders).length} riders
                      {riderFilter === 'payment-due' && filterRiders(batch.riders).length !== batch.riders.length && 
                        ` (of ${batch.riders.length})`
                      }
                    </span>
                    <span className={`batch-card__toggle ${isExpanded ? 'batch-card__toggle--open' : ''}`} onClick={() => toggleBatch(batchId)}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="batch-card__content">
                    {filterRiders(batch.riders).length === 0 ? (
                      <div className="no-riders-message">
                        No riders with payment due in this batch
                      </div>
                    ) : (
                      <table className="riders-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Active Classes</th>
                            <th>Level</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterRiders(batch.riders).map((rider) => (
                            <tr key={rider.id}>
                              <td>
                                <div className="rider-name">
                                  <span className="rider-avatar">🏇</span>
                                  {rider.name}
                                </div>
                              </td>
                              <td>{rider.age} yrs</td>
                              <td>
                                <span className={`active-classes ${needsToPay(rider) ? 'active-classes--warning' : ''}`}>
                                  {rider.activeClassesCount} classes
                                </span>
                              </td>
                              <td>
                                <span className={`level-badge level-badge--${rider.level}`}>
                                  {rider.level}
                                </span>
                              </td>
                              <td title={rider.joinedDate}>{formatJoinedDate(rider.joinedDate)}</td>
                              <td>
                                <div className="rider-actions">
                                  <button 
                                    className="checkin-btn"
                                    onClick={() => setCheckinModal({ isOpen: true, rider, batchType: 'evening', batchIndex: index })}
                                    title="Check-in"
                                  >
                                    Check-in
                                  </button>
                                  <button 
                                    className="assign-btn"
                                    onClick={() => setAssignBatchModal({ isOpen: true, rider, sourceBatchType: 'evening', sourceBatchIndex: index })}
                                    title="Assign to Batch"
                                  >
                                    Move
                                  </button>
                                  <button 
                                    className={`pay-btn ${needsToPay(rider) ? 'pay-btn--unpaid' : 'pay-btn--paid'}`}
                                    onClick={() => setPaymentModal({ isOpen: true, rider, batchType: 'evening', batchIndex: index })}
                                    disabled={!needsToPay(rider)}
                                  >
                                    {needsToPay(rider) ? 'Pay' : 'Paid ✓'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      </>
      )}

      {/* Add Rider Button */}
      <button className="add-rider-btn" onClick={() => setAddRiderModal(true)}>
        <span>➕</span>
        Add New Rider
      </button>

      {/* Check-in Confirmation Modal */}
      {checkinModal.isOpen && checkinModal.rider && (
        <div className="modal-overlay" onClick={() => setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}>
          <div className="modal modal--checkin" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">✅ Confirm Check-in</h2>
              <button 
                className="modal__close"
                onClick={() => setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
                <div className="modal__rider-avatar">🏇</div>
                <div className="modal__rider-details">
                  <h3 className="modal__rider-name">{checkinModal.rider.name}</h3>
                  <p className="modal__rider-meta">
                    {checkinModal.rider.level} • {checkinModal.batchType === 'morning' ? '🌅 Morning' : '🌆 Evening'} {
                      checkinModal.batchType === 'morning' 
                        ? morningBatches[checkinModal.batchIndex]?.name 
                        : eveningBatches[checkinModal.batchIndex]?.name
                    }
                  </p>
                </div>
              </div>
              
              <div className="checkin-info">
                <div className="checkin-info__current">
                  <span className="checkin-info__label">Current Classes</span>
                  <span className="checkin-info__value">{checkinModal.rider.activeClassesCount}</span>
                </div>
                <div className="checkin-info__arrow">→</div>
                <div className="checkin-info__new">
                  <span className="checkin-info__label">After Check-in</span>
                  <span className="checkin-info__value">{checkinModal.rider.activeClassesCount + 1}</span>
                </div>
              </div>

              <p className="modal__message">
                Confirm check-in for <strong>{checkinModal.rider.name}</strong>? This will add 1 class to their active classes count.
              </p>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                Cancel
              </button>
              <button 
                className="modal__btn modal__btn--checkin"
                onClick={handleCheckin}
              >
                ✓ Confirm Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Rider Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.rider && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}>
          <div className="modal modal--delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">⚠️ Remove Rider</h2>
              <button 
                className="modal__close"
                onClick={() => setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
                <div className="modal__rider-avatar">🏇</div>
                <div className="modal__rider-details">
                  <h3 className="modal__rider-name">{deleteModal.rider.name}</h3>
                  <p className="modal__rider-meta">
                    {deleteModal.batchType === 'morning' ? '🌅 Morning' : '🌆 Evening'} - {
                      deleteModal.batchType === 'morning' 
                        ? morningBatches[deleteModal.batchIndex]?.name 
                        : eveningBatches[deleteModal.batchIndex]?.name
                    }
                  </p>
                </div>
              </div>
              <p className="modal__message modal__message--warning">
                Are you sure you want to remove <strong>{deleteModal.rider.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                Cancel
              </button>
              <button 
                className="modal__btn modal__btn--danger"
                onClick={handleDeleteRider}
              >
                Remove Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rider Modal */}
      {editRiderModal.isOpen && editRiderModal.rider && (
        <div className="modal-overlay" onClick={() => setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}>
          <div className="modal modal--edit-rider" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">✏️ Edit Rider</h2>
              <button 
                className="modal__close"
                onClick={() => setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <form className="add-rider-form" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="edit-rider-name">Name *</label>
                    <input
                      type="text"
                      id="edit-rider-name"
                      value={editRiderData.name}
                      onChange={(e) => setEditRiderData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="edit-rider-age">Age *</label>
                    <input
                      type="number"
                      id="edit-rider-age"
                      min="5"
                      max="80"
                      value={editRiderData.age}
                      onChange={(e) => setEditRiderData(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="edit-rider-phone">Phone *</label>
                    <input
                      type="tel"
                      id="edit-rider-phone"
                      value={editRiderData.phone}
                      onChange={(e) => setEditRiderData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="edit-rider-email">Email</label>
                    <input
                      type="email"
                      id="edit-rider-email"
                      value={editRiderData.email}
                      onChange={(e) => setEditRiderData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="edit-rider-level">Skill Level</label>
                  <select
                    id="edit-rider-level"
                    value={editRiderData.level}
                    onChange={(e) => setEditRiderData(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-field form-field--readonly">
                  <label>Joining Date</label>
                  <input
                    type="text"
                    value={editRiderModal.rider.joinedDate}
                    disabled
                    className="input--disabled"
                  />
                  <span className="form-field__hint">Joining date cannot be edited</span>
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                Cancel
              </button>
              <button 
                className="modal__btn modal__btn--confirm"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Timing Modal */}
      {editBatchModal.isOpen && (
        <div className="modal-overlay" onClick={() => setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })}>
          <div className="modal modal--edit-batch" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">⏰ Edit Batch Timing</h2>
              <button 
                className="modal__close"
                onClick={() => setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="edit-batch-info">
                <span className="edit-batch-type">
                  {editBatchModal.batchType === 'morning' ? '🌅 Morning' : '🌆 Evening'}
                </span>
              </div>
              <form className="edit-batch-form" onSubmit={(e) => { e.preventDefault(); handleSaveBatchTiming(); }}>
                <div className="form-field">
                  <label htmlFor="batch-name">Batch Name</label>
                  <input
                    type="text"
                    id="batch-name"
                    value={editBatchModal.name}
                    onChange={(e) => setEditBatchModal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Batch 1"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="batch-time">Timing</label>
                  <input
                    type="text"
                    id="batch-time"
                    value={editBatchModal.time}
                    onChange={(e) => setEditBatchModal(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g., 6:00 AM - 7:30 AM"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })}
              >
                Cancel
              </button>
              <button 
                className="modal__btn modal__btn--confirm"
                onClick={handleSaveBatchTiming}
              >
                Save Timing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Rider Modal */}
      {addRiderModal && (
        <div className="modal-overlay" onClick={() => setAddRiderModal(false)}>
          <div className="modal modal--add-rider" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">🏇 Add New Rider</h2>
              <button 
                className="modal__close"
                onClick={() => setAddRiderModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <form className="add-rider-form" onSubmit={(e) => { e.preventDefault(); handleAddRider(); }}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="rider-name">Name *</label>
                    <input
                      type="text"
                      id="rider-name"
                      placeholder="Enter rider's name"
                      value={newRider.name}
                      onChange={(e) => setNewRider(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="rider-age">Age *</label>
                    <input
                      type="number"
                      id="rider-age"
                      placeholder="Age"
                      min="5"
                      max="80"
                      value={newRider.age}
                      onChange={(e) => setNewRider(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="rider-phone">Phone *</label>
                    <input
                      type="tel"
                      id="rider-phone"
                      placeholder="+91 98765 43210"
                      value={newRider.phone}
                      onChange={(e) => setNewRider(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="rider-email">Email</label>
                    <input
                      type="email"
                      id="rider-email"
                      placeholder="email@example.com"
                      value={newRider.email}
                      onChange={(e) => setNewRider(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="rider-level">Skill Level</label>
                  <select
                    id="rider-level"
                    value={newRider.level}
                    onChange={(e) => setNewRider(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Assign to Batch *</label>
                  <div className="batch-select-grid">
                    <div className="batch-select-group">
                      <span className="batch-select-label">🌅 Morning</span>
                      {morningBatches.map((batch, idx) => (
                        <label key={`morning-${idx}`} className="batch-radio">
                          <input
                            type="radio"
                            name="batch"
                            checked={newRider.batchType === 'morning' && newRider.batchIndex === idx}
                            onChange={() => setNewRider(prev => ({ ...prev, batchType: 'morning', batchIndex: idx }))}
                          />
                          <span className="batch-radio__content">
                            <span className="batch-radio__name">{batch.name}</span>
                            <span className="batch-radio__time">{batch.time}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="batch-select-group">
                      <span className="batch-select-label">🌆 Evening</span>
                      {eveningBatches.map((batch, idx) => (
                        <label key={`evening-${idx}`} className="batch-radio">
                          <input
                            type="radio"
                            name="batch"
                            checked={newRider.batchType === 'evening' && newRider.batchIndex === idx}
                            onChange={() => setNewRider(prev => ({ ...prev, batchType: 'evening', batchIndex: idx }))}
                          />
                          <span className="batch-radio__content">
                            <span className="batch-radio__name">{batch.name}</span>
                            <span className="batch-radio__time">{batch.time}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setAddRiderModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal__btn modal__btn--confirm"
                onClick={handleAddRider}
              >
                Add Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Batch Modal */}
      {assignBatchModal.isOpen && assignBatchModal.rider && (
        <div className="modal-overlay" onClick={() => setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0 })}>
          <div className="modal modal--assign" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">🔄 Move to Batch</h2>
              <button 
                className="modal__close"
                onClick={() => setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0 })}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
                <div className="modal__rider-avatar">🏇</div>
                <div className="modal__rider-details">
                  <h3 className="modal__rider-name">{assignBatchModal.rider.name}</h3>
                  <p className="modal__rider-meta">
                    Currently in: {assignBatchModal.sourceBatchType === 'morning' ? '🌅 Morning' : '🌆 Evening'} - {
                      assignBatchModal.sourceBatchType === 'morning' 
                        ? morningBatches[assignBatchModal.sourceBatchIndex]?.name 
                        : eveningBatches[assignBatchModal.sourceBatchIndex]?.name
                    }
                  </p>
                </div>
              </div>
              
              <div className="batch-selection">
                <h4 className="batch-selection__title">Select Target Batch</h4>
                
                <div className="batch-selection__group">
                  <h5 className="batch-selection__group-title">🌅 Morning Batches</h5>
                  <div className="batch-selection__options">
                    {morningBatches.map((batch, idx) => {
                      const isCurrent = assignBatchModal.sourceBatchType === 'morning' && assignBatchModal.sourceBatchIndex === idx
                      return (
                        <button
                          key={`morning-${idx}`}
                          className={`batch-option ${isCurrent ? 'batch-option--current' : ''}`}
                          onClick={() => handleMoveToBatch('morning', idx)}
                          disabled={isCurrent}
                        >
                          <span className="batch-option__name">{batch.name}</span>
                          <span className="batch-option__time">{batch.time}</span>
                          <span className="batch-option__count">{batch.riders.length} riders</span>
                          {isCurrent && <span className="batch-option__current-tag">Current</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div className="batch-selection__group">
                  <h5 className="batch-selection__group-title">🌆 Evening Batches</h5>
                  <div className="batch-selection__options">
                    {eveningBatches.map((batch, idx) => {
                      const isCurrent = assignBatchModal.sourceBatchType === 'evening' && assignBatchModal.sourceBatchIndex === idx
                      return (
                        <button
                          key={`evening-${idx}`}
                          className={`batch-option ${isCurrent ? 'batch-option--current' : ''}`}
                          onClick={() => handleMoveToBatch('evening', idx)}
                          disabled={isCurrent}
                        >
                          <span className="batch-option__name">{batch.name}</span>
                          <span className="batch-option__time">{batch.time}</span>
                          <span className="batch-option__count">{batch.riders.length} riders</span>
                          {isCurrent && <span className="batch-option__current-tag">Current</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0 })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {paymentModal.isOpen && paymentModal.rider && (
        <div className="modal-overlay" onClick={() => setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">💰 Confirm Payment</h2>
              <button 
                className="modal__close"
                onClick={() => setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
                <div className="modal__rider-avatar">🏇</div>
                <div className="modal__rider-details">
                  <h3 className="modal__rider-name">{paymentModal.rider.name}</h3>
                  <p className="modal__rider-meta">
                    {paymentModal.rider.level} • {paymentModal.rider.activeClassesCount} active classes
                  </p>
                </div>
              </div>
              <div className="modal__status">
                <span className="modal__status-label">Active Classes:</span>
                <span className="modal__status-value unpaid">
                  {paymentModal.rider.activeClassesCount} classes (≥26 requires payment)
                </span>
              </div>
              <div className="modal__deduction">
                <span className="modal__deduction-label">After Payment:</span>
                <span className="modal__deduction-value">
                  {paymentModal.rider.activeClassesCount} - 26 = <strong>{paymentModal.rider.activeClassesCount - 26} classes</strong>
                </span>
              </div>
              <p className="modal__message">
                Are you sure you want to mark this rider's fees as paid? This will deduct 26 classes from their active classes.
              </p>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
              >
                Cancel
              </button>
              <button 
                className="modal__btn modal__btn--confirm"
                onClick={handlePayment}
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderPlaceholder = (title: string) => (
    <div className="placeholder-page">
      <div className="placeholder-icon">🚧</div>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-text">This section is coming soon!</p>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'horses':
        return renderHorses()
      case 'riders':
        return renderRiders()
      case 'bookings':
        return renderPlaceholder('Bookings Management')
      case 'staff':
        return renderPlaceholder('Staff Management')
      case 'reports':
        return renderPlaceholder('Reports & Analytics')
      case 'settings':
        return renderPlaceholder('Settings')
      default:
        return renderOverview()
    }
  }

  return (
    <div className="admin">
      {/* Sidebar */}
      <aside className="admin__sidebar">
        <div className="admin__logo">
          <span className="admin__logo-icon">🐴</span>
          <span className="admin__logo-text">Equine Enclave</span>
        </div>
        
        <nav className="admin__nav">
          <button 
            className={`admin__nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="admin__nav-icon">📊</span>
            Overview
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'horses' ? 'active' : ''}`}
            onClick={() => setActiveTab('horses')}
          >
            <span className="admin__nav-icon">🐎</span>
            Horses
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'riders' ? 'active' : ''}`}
            onClick={() => setActiveTab('riders')}
          >
            <span className="admin__nav-icon">🏇</span>
            Riders
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="admin__nav-icon">📅</span>
            Bookings
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <span className="admin__nav-icon">🧑‍💼</span>
            Staff
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="admin__nav-icon">📈</span>
            Reports
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="admin__nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="admin__sidebar-footer">
          <Link to="/" className="admin__back-link">
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin__main">
        {/* Header */}
        <header className="admin__header">
          <div className="admin__header-left">
            <h1 className="admin__title">{getPageTitle()}</h1>
            <p className="admin__subtitle">{getPageSubtitle()}</p>
          </div>
          <div className="admin__header-right">
            <div className="admin__search">
              <input type="text" placeholder="Search..." />
            </div>
            <button className="admin__notification">
              🔔
              <span className="admin__notification-badge">3</span>
            </button>
            <div className="admin__user">
              <div className="admin__avatar">JD</div>
              <span className="admin__user-name">Jane Doe</span>
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  )
}

export default AdminDashboard
