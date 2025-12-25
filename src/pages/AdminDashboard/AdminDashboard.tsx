import { useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SchoolIcon from '@mui/icons-material/School'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EventNoteIcon from '@mui/icons-material/EventNote'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import NightsStayIcon from '@mui/icons-material/NightsStay'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import InboxIcon from '@mui/icons-material/Inbox'
import './AdminDashboard.css'

// Horse Icon Image Component
const HorseIcon = ({ size = 32 }: { size?: number }) => (
  <img 
    src="/horse-icon.png" 
    alt="Horse" 
    style={{ 
      width: size, 
      height: size, 
      objectFit: 'cover',
      borderRadius: '50%'
    }} 
  />
)

// Rider Icon Image Component
const RiderIcon = ({ size = 32 }: { size?: number }) => (
  <img 
    src="/rider-icon.png" 
    alt="Rider" 
    style={{ 
      width: size, 
      height: size, 
      objectFit: 'cover',
      borderRadius: '50%'
    }} 
  />
)

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api')

interface AdminUser {
  id: string
  username: string
  name: string
  email: string
  role: string
}

interface StatCard {
  title: string
  value: string | number
  change: string
  icon: ReactNode
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

interface CheckinRecord {
  rideNumber: number
  checkinTime: string
  horse: string
  paid: boolean
}

interface Rider {
  id: string
  _id?: string
  name: string
  age: number
  phone: string
  email: string
  checkins: CheckinRecord[]
  activeClassesCount: number
  level: 'beginner' | 'intermediate' | 'advanced'
  gender: 'male' | 'female'
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

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface RideRecord {
  _id: string
  rideTime: string
  riderName: string
  riderId: string
  riderLevel: 'beginner' | 'intermediate' | 'advanced'
  horse: string
  batchType: string
  batchName: string
}

interface HorseAnalytics {
  horseName: string
  totalRides: number
  beginnerRides: number
  intermediateRides: number
  advancedRides: number
  totalHours: number
  beginnerHours: number
  intermediateHours: number
  advancedHours: number
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [, setAdminUser] = useState<AdminUser | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
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
  
  const [addBatchModal, setAddBatchModal] = useState<{
    isOpen: boolean;
    batchType: 'morning' | 'evening';
    name: string;
    time: string;
  }>({ isOpen: false, batchType: 'morning', name: '', time: '' })
  
  const [deleteBatchModal, setDeleteBatchModal] = useState<{
    isOpen: boolean;
    batch: Batch | null;
    batchType: 'morning' | 'evening';
  }>({ isOpen: false, batch: null, batchType: 'morning' })
  const [assignBatchModal, setAssignBatchModal] = useState<{ 
    isOpen: boolean; 
    rider: Rider | null; 
    sourceBatchType: 'morning' | 'evening'; 
    sourceBatchIndex: number;
    targetBatchType: 'morning' | 'evening' | null;
    targetBatchIndex: number | null;
    isConfirming: boolean;
    isMoving: boolean;
  }>({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })
  
  const [addRiderModal, setAddRiderModal] = useState(false)
  const [checkinModal, setCheckinModal] = useState<{
    isOpen: boolean;
    rider: Rider | null;
    batchType: 'morning' | 'evening';
    batchIndex: number;
    selectedHorse: string;
  }>({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0, selectedHorse: '' })
  const [horseDropdownOpen, setHorseDropdownOpen] = useState(false)
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false)
  const [editLevelDropdownOpen, setEditLevelDropdownOpen] = useState(false)
  const [reportsHorseDropdownOpen, setReportsHorseDropdownOpen] = useState(false)
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false)
  const [editGenderDropdownOpen, setEditGenderDropdownOpen] = useState(false)
  
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
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    gender: 'male' as 'male' | 'female'
  })
  const [newRider, setNewRider] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    gender: 'male' as 'male' | 'female',
    batchType: 'morning' as 'morning' | 'evening',
    batchIndex: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Batch states
  const [morningBatches, setMorningBatches] = useState<Batch[]>([])
  const [eveningBatches, setEveningBatches] = useState<Batch[]>([])
  
  // Today's check-ins count by batch type (resets daily)
  const [todayCheckins, setTodayCheckins] = useState<{ morning: number; evening: number }>({ morning: 0, evening: 0 })
  
  // Reports state
  const [allRides, setAllRides] = useState<RideRecord[]>([])
  const [selectedReportHorse, setSelectedReportHorse] = useState<string>('')
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportPeriod, setReportPeriod] = useState<'1day' | '1week' | '1month' | '2months' | '3months'>('1day')
  const [reportPeriodDropdownOpen, setReportPeriodDropdownOpen] = useState(false)
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    addBatch: { name?: string; time?: string };
    addRider: { name?: string; age?: string; phone?: string };
    editRider: { name?: string; age?: string; phone?: string };
    editBatch: { name?: string; time?: string };
    checkin: { horse?: string };
  }>({
    addBatch: {},
    addRider: {},
    editRider: {},
    editBatch: {},
    checkin: {}
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<Rider & { batchName: string; batchLabel: string }>>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null)
  const [tableSearchFilter, setTableSearchFilter] = useState('')
  const [maxPersonsDropdownOpen, setMaxPersonsDropdownOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    return (savedTheme as 'dark' | 'light') || 'dark'
  })
  const [maxPersonsPerBatch, setMaxPersonsPerBatch] = useState<number>(() => {
    const saved = localStorage.getItem('max-persons-per-batch')
    return saved ? parseInt(saved) : 5
  })

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('admin-theme', newTheme)
  }

  // Max persons per batch handler
  const handleMaxPersonsChange = (value: number) => {
    setMaxPersonsPerBatch(value)
    localStorage.setItem('max-persons-per-batch', value.toString())
  }

  // Check if batch is full
  const isBatchFull = (batch: Batch) => {
    return batch.riders.length >= maxPersonsPerBatch
  }

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin-token')
      const storedUser = localStorage.getItem('admin-user')

      if (!token || !storedUser) {
        setAuthChecking(false)
        navigate('/login')
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const result = await response.json()

        if (result.success) {
          setIsAuthenticated(true)
          setAdminUser(result.data.user)
        } else {
          // Token invalid, clear and redirect
          localStorage.removeItem('admin-token')
          localStorage.removeItem('admin-user')
          navigate('/login')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        // On error, try to use stored user data
        try {
          const user = JSON.parse(storedUser)
          setIsAuthenticated(true)
          setAdminUser(user)
        } catch {
          navigate('/login')
        }
      } finally {
        setAuthChecking(false)
      }
    }

    checkAuth()
  }, [navigate])

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = 
      paymentModal.isOpen || 
      addRiderModal || 
      checkinModal.isOpen || 
      deleteModal.isOpen || 
      editRiderModal.isOpen || 
      assignBatchModal.isOpen || 
      editBatchModal.isOpen || 
      addBatchModal.isOpen || 
      deleteBatchModal.isOpen

    if (isAnyModalOpen) {
      // Save scroll position and lock body
      const scrollY = window.scrollY
      document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`)
      document.body.classList.add('modal-open')
    } else {
      // Restore scroll position
      document.body.classList.remove('modal-open')
      const scrollY = document.documentElement.style.getPropertyValue('--scroll-y')
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0'))
      }
    }
  }, [paymentModal.isOpen, addRiderModal, checkinModal.isOpen, deleteModal.isOpen, editRiderModal.isOpen, assignBatchModal.isOpen, editBatchModal.isOpen, addBatchModal.isOpen, deleteBatchModal.isOpen])

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    setIsAuthenticated(false)
    setAdminUser(null)
    navigate('/login')
  }

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const searchLower = query.toLowerCase()
    const results: Array<Rider & { batchName: string; batchLabel: string }> = []

    // Search in morning batches
    morningBatches.filter(b => b != null).forEach((batch) => {
      batch.riders.forEach(rider => {
        if (
          rider.name.toLowerCase().includes(searchLower) ||
          rider.phone.includes(query) ||
          rider.email.toLowerCase().includes(searchLower)
        ) {
          results.push({
            ...rider,
            batchName: batch.name,
            batchLabel: 'Morning'
          })
        }
      })
    })

    // Search in evening batches
    eveningBatches.filter(b => b != null).forEach((batch) => {
      batch.riders.forEach(rider => {
        if (
          rider.name.toLowerCase().includes(searchLower) ||
          rider.phone.includes(query) ||
          rider.email.toLowerCase().includes(searchLower)
        ) {
          results.push({
            ...rider,
            batchName: batch.name,
            batchLabel: 'Evening'
          })
        }
      })
    })

    setSearchResults(results)
    setShowSearchResults(true)
  }

  // Close search results when clicking outside
  const closeSearchResults = () => {
    setShowSearchResults(false)
  }

  // Handle Enter key to show all search results in table
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setActiveTab('riders')
      setRiderFilter('all-details')
      setSelectedRiderId(null)
      setTableSearchFilter(searchQuery.trim())
      setShowSearchResults(false)
    } else if (e.key === 'Escape') {
      setShowSearchResults(false)
    }
  }

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
    
    // Validate fields
    const errors: { name?: string; time?: string } = {}
    if (!name.trim()) errors.name = 'Batch name is required'
    if (!time.trim()) errors.time = 'Timing is required'
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, editBatch: errors }))
      return
    }
    
    setFormErrors(prev => ({ ...prev, editBatch: {} }))
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/batches/by-type/${batchType}/${batchIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, time })
      })
      const result = await response.json()
      
      if (result.success) {
        const batchName = name
        await fetchBatches() // Refresh data
        setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })
        showToast(`${batchName} timing updated!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to update batch timing', 'error')
      }
    } catch (err) {
      console.error('Error updating batch timing:', err)
      setLoading(false)
      showToast('Failed to update batch timing', 'error')
    }
  }

  // Function to add new batch
  const handleAddBatch = async () => {
    const { batchType, name, time } = addBatchModal
    
    // Validate fields
    const errors: { name?: string; time?: string } = {}
    if (!name.trim()) errors.name = 'Batch name is required'
    if (!time.trim()) errors.time = 'Timing is required'
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, addBatch: errors }))
      return
    }
    
    setFormErrors(prev => ({ ...prev, addBatch: {} }))
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, time, batchType })
      })
      const result = await response.json()
      
      if (result.success) {
        const batchName = name
        await fetchBatches() // Refresh data
        setAddBatchModal({ isOpen: false, batchType: 'morning', name: '', time: '' })
        showToast(`${batchName} created successfully!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to add batch', 'error')
      }
    } catch (err) {
      console.error('Error adding batch:', err)
      setLoading(false)
      showToast('Failed to add batch', 'error')
    }
  }

  // Function to delete batch
  const handleDeleteBatch = async () => {
    if (!deleteBatchModal.batch?._id) {
      showToast('Cannot delete batch - missing batch ID', 'error')
      return
    }
    
    const batchName = deleteBatchModal.batch.name
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${deleteBatchModal.batch._id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        setDeleteBatchModal({ isOpen: false, batch: null, batchType: 'morning' })
        showToast(`${batchName} deleted successfully!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to delete batch', 'error')
      }
    } catch (err) {
      console.error('Error deleting batch:', err)
      setLoading(false)
      showToast('Failed to delete batch', 'error')
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

  // Fetch rides for reports
  const fetchRides = async () => {
    try {
      setReportsLoading(true)
      const response = await fetch(`${API_BASE_URL}/rides?limit=1000`)
      const result = await response.json()
      
      if (result.success) {
        setAllRides(result.data)
      }
    } catch (err) {
      console.error('Error fetching rides:', err)
    } finally {
      setReportsLoading(false)
    }
  }

  // Fetch today's check-ins from API
  const fetchTodayCheckins = async () => {
    try {
      // Send timezone offset to ensure "today" is calculated in user's local timezone
      const tzOffset = new Date().getTimezoneOffset()
      const response = await fetch(`${API_BASE_URL}/rides/stats/summary?tzOffset=${tzOffset}`)
      const result = await response.json()
      
      if (result.success && result.data.todayCheckins) {
        setTodayCheckins(result.data.todayCheckins)
      }
    } catch (err) {
      console.error('Error fetching today\'s check-ins:', err)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchBatches()
    fetchTodayCheckins()
  }, [])
  
  // Fetch rides when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports' && allRides.length === 0) {
      fetchRides()
    }
  }, [activeTab])

  const stats: StatCard[] = [
    { title: 'Total Horses', value: 8, change: '+1 this month', icon: <HorseIcon size={32} />, trend: 'up' },
    { title: 'Active Bookings', value: 23, change: '+5 this week', icon: <CalendarMonthIcon sx={{ fontSize: 32, color: '#d4af37' }} />, trend: 'up' },
    { title: 'Lesson Hours', value: 156, change: '-3% vs last month', icon: <SchoolIcon sx={{ fontSize: 32, color: '#d4af37' }} />, trend: 'down' },
  ]

  const recentBookings: Booking[] = [
    { id: 1, client: 'Sarah Mitchell', service: 'Private Lesson', date: '2025-12-10', status: 'confirmed' },
    { id: 2, client: 'John Peterson', service: 'Horse Boarding', date: '2025-12-09', status: 'pending' },
    { id: 3, client: 'Emily Chen', service: 'Trail Ride', date: '2025-12-11', status: 'confirmed' },
    { id: 4, client: 'Michael Brown', service: 'Training Session', date: '2025-12-09', status: 'completed' },
    { id: 5, client: 'Lisa Anderson', service: 'Group Lesson', date: '2025-12-12', status: 'pending' },
  ]

  const horses: Horse[] = [
    { id: 1, name: 'Alishan', breed: 'Marwari', age: 7, color: 'Bay', stall: 'A-01', status: 'healthy', lastCheckup: '2025-12-01', notes: 'Excellent condition, very energetic' },
    { id: 2, name: 'Aslan', breed: 'Thoroughbred', age: 5, color: 'Chestnut', stall: 'A-02', status: 'healthy', lastCheckup: '2025-11-28', notes: 'Great for training sessions' },
    { id: 3, name: 'Timur', breed: 'Thoroughbred', age: 8, color: 'Golden', stall: 'A-03', status: 'healthy', lastCheckup: '2025-12-05', notes: 'Show horse, competition ready' },
    { id: 4, name: 'Heera', breed: 'Marwari', age: 6, color: 'White', stall: 'B-01', status: 'attention', lastCheckup: '2025-12-08', notes: 'Minor leg strain, light exercise only' },
    { id: 5, name: 'Clara', breed: 'Marwari', age: 4, color: 'Black', stall: 'B-02', status: 'healthy', lastCheckup: '2025-12-03', notes: 'Young and spirited, great potential' },
    { id: 6, name: 'XLove', breed: 'Thoroughbred', age: 9, color: 'Dark Bay', stall: 'B-03', status: 'healthy', lastCheckup: '2025-11-30', notes: 'Experienced jumper, calm temperament' },
    { id: 7, name: 'Baadshah', breed: 'Marwari', age: 10, color: 'Black', stall: 'C-01', status: 'treatment', lastCheckup: '2025-12-09', notes: 'Recovering from cold, on medication' },
    { id: 8, name: 'Antilope', breed: 'Thoroughbred', age: 6, color: 'Grey', stall: 'C-02', status: 'healthy', lastCheckup: '2025-12-02', notes: 'Dressage specialist, very graceful' },
    { id: 9, name: 'Virat', breed: 'Marwari', age: 7, color: 'Bay', stall: 'A-01', status: 'healthy', lastCheckup: '2025-12-01', notes: 'Excellent condition, very energetic' },
  ]

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

  // Check if rider has already checked in today (latest checkin is always the last item)
  const hasCheckedInToday = (rider: Rider) => {
    if (!rider.checkins || rider.checkins.length === 0) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastCheckin = rider.checkins[rider.checkins.length - 1]
    const checkinDate = new Date(lastCheckin.checkinTime)
    checkinDate.setHours(0, 0, 0, 0)
    
    return checkinDate.getTime() === today.getTime()
  }

  // Get horse name from today's check-in (returns null if not checked in today)
  const getTodayCheckinHorse = (rider: Rider): string | null => {
    if (!rider.checkins || rider.checkins.length === 0) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastCheckin = rider.checkins[rider.checkins.length - 1]
    const checkinDate = new Date(lastCheckin.checkinTime)
    checkinDate.setHours(0, 0, 0, 0)
    
    if (checkinDate.getTime() === today.getTime()) {
      return lastCheckin.horse
    }
    return null
  }

  // Check if rider is currently in session (last check-in < 45 minutes ago)
  const isRiderInSession = (rider: Rider) => {
    if (!rider.checkins || rider.checkins.length === 0) return false
    
    // Get the most recent check-in (unpaid ones first, then by time)
    const unpaidCheckins = rider.checkins.filter(c => !c.paid)
    if (unpaidCheckins.length === 0) return false
    
    // Sort by checkin time descending to get the latest
    const sortedCheckins = [...unpaidCheckins].sort((a, b) => 
      new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime()
    )
    
    const lastCheckin = sortedCheckins[0]
    const lastCheckinTime = new Date(lastCheckin.checkinTime).getTime()
    const now = Date.now()
    const minutesSinceCheckin = (now - lastCheckinTime) / (1000 * 60)
    
    return minutesSinceCheckin < 45
  }

  // Check if rider completed a ride today (but not currently in session)
  const hasRiddenToday = (rider: Rider) => {
    if (!rider.checkins || rider.checkins.length === 0) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if any checkin is from today
    return rider.checkins.some(checkin => {
      const checkinDate = new Date(checkin.checkinTime)
      checkinDate.setHours(0, 0, 0, 0)
      return checkinDate.getTime() === today.getTime()
    })
  }

  // Export rider check-in history to PDF
  const exportRiderPDF = async (rider: Rider, batchType: 'morning' | 'evening', batchIndex: number) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Load logo image with dimensions
    const loadLogo = (): Promise<{ data: string; width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)
          resolve({
            data: canvas.toDataURL('image/png'),
            width: img.width,
            height: img.height
          })
        }
        img.onerror = reject
        img.src = '/logo.png'
      })
    }
    
    let logoData: string | null = null
    let logoWidth = 0
    let logoHeight = 0
    try {
      const logo = await loadLogo()
      logoData = logo.data
      logoWidth = logo.width
      logoHeight = logo.height
    } catch (e) {
      console.warn('Could not load logo:', e)
    }
    
    // Get batch name
    const batches = batchType === 'morning' ? morningBatches : eveningBatches
    const batchName = batches[batchIndex]?.name || `Batch ${batchIndex + 1}`
    
    // Header with logo
    doc.setFillColor(26, 26, 46)
    const headerHeight = 48
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    
    // Add logo if loaded - preserve natural aspect ratio
    if (logoData && logoWidth > 0 && logoHeight > 0) {
      const targetHeight = 40 // Target height in PDF units
      const aspectRatio = logoWidth / logoHeight
      const targetWidth = targetHeight * aspectRatio
      const logoY = (headerHeight - targetHeight) / 2 // Center vertically
      doc.addImage(logoData, 'PNG', 8, logoY, targetWidth, targetHeight)
    }
    
    doc.setTextColor(212, 175, 55)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Equine Enclave', pageWidth / 2, 18, { align: 'center' })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Classes Check-in Report', pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(9)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 40, { align: 'center' })
    
    // Rider details section
    doc.setTextColor(0, 0, 0)
    let y = 58
    
    // Section header with colored bar (matching daily report style)
    const riderSectionColor: [number, number, number] = [52, 152, 219] // Blue color for Rider Details
    doc.setFillColor(...riderSectionColor)
    doc.rect(20, y - 5, 4, 12, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Rider Details', 28, y + 3)
    y += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${rider.name}`, 20, y)
    doc.text(`Age: ${rider.age} years`, 120, y)
    y += 8
    doc.text(`Level: ${rider.level.charAt(0).toUpperCase() + rider.level.slice(1)}`, 20, y)
    doc.text(`Batch: ${batchType.charAt(0).toUpperCase() + batchType.slice(1)} - ${batchName}`, 120, y)
    y += 8
    doc.text(`Phone: ${rider.phone}`, 20, y)
    doc.text(`Email: ${rider.email || 'N/A'}`, 120, y)
    y += 8
    doc.text(`Joined: ${rider.joinedDate}`, 20, y)
    doc.text(`Total Classes: ${rider.activeClassesCount}`, 120, y)
    
    // Filter only unpaid checkins and sort by date (newest first)
    const checkins = rider.checkins || []
    const unpaidCheckins = checkins.filter(c => !c.paid)
    const sortedCheckins = [...unpaidCheckins].sort((a, b) => 
      new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime()
    )
    
    // Check-ins section
    y += 15
    
    // Section header with colored bar (matching daily report style)
    const sectionColor: [number, number, number] = [212, 175, 55] // Gold color for Check-in History
    doc.setFillColor(...sectionColor)
    doc.rect(20, y - 5, 4, 12, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(`Check-in History (${sortedCheckins.length} rides)`, 28, y + 3)
    y += 15
    
    // Table headers with light gray background (matching daily report style)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(245, 245, 245)
    doc.rect(20, y - 4, pageWidth - 40, 8, 'F')
    doc.text('Ride #', 22, y)
    doc.text('Date', 50, y)
    doc.text('Time', 100, y)
    doc.text('Horse', 140, y)
    y += 8
    
    // Table rows
    doc.setFont('helvetica', 'normal')
    
    sortedCheckins.forEach((checkin, index) => {
      // Check if we need a new page
      if (y > 280) {
        doc.addPage()
        y = 20
        // Re-add headers on new page with same styling
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(245, 245, 245)
        doc.rect(20, y - 4, pageWidth - 40, 8, 'F')
        doc.text('Ride #', 22, y)
        doc.text('Date', 50, y)
        doc.text('Time', 100, y)
        doc.text('Horse', 140, y)
        y += 8
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
      }
      
      const checkinDate = new Date(checkin.checkinTime)
      const dateStr = checkinDate.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
      const timeStr = checkinDate.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      
      // Number from total unpaid count (top is highest, goes down)
      const displayNumber = sortedCheckins.length - index
      doc.text(String(displayNumber), 22, y)
      doc.text(dateStr, 50, y)
      doc.text(timeStr, 100, y)
      doc.text(checkin.horse || 'N/A', 140, y)
      y += 6
    })
    
    if (sortedCheckins.length === 0) {
      doc.text('No unpaid check-ins to display.', 20, y)
    }
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Generated on ${new Date().toLocaleString('en-IN')} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      )
    }
    
    // Save the PDF
    const fileName = `${rider.name.replace(/\s+/g, '_')}_checkins_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  // Download rides report PDF
  const downloadRidesReport = async () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Load logo image with dimensions
    const loadLogo = (): Promise<{ data: string; width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)
          resolve({
            data: canvas.toDataURL('image/png'),
            width: img.width,
            height: img.height
          })
        }
        img.onerror = reject
        img.src = '/logo.png'
      })
    }
    
    let logoData: string | null = null
    let logoWidth = 0
    let logoHeight = 0
    try {
      const logo = await loadLogo()
      logoData = logo.data
      logoWidth = logo.width
      logoHeight = logo.height
    } catch (e) {
      console.warn('Could not load logo:', e)
    }
    
    // Calculate date range based on selected period
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Helper function to get date string (YYYY-MM-DD) in local timezone
    const getDateString = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const todayString = getDateString(today)
    let startDate: Date
    let endDate: Date = now
    
    switch (reportPeriod) {
      case '1day':
        // Today only - compare by date string
        startDate = new Date(today)
        break
      case '1week':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 6) // Last 7 days including today
        break
      case '1month':
        startDate = new Date(today)
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case '2months':
        startDate = new Date(today)
        startDate.setMonth(startDate.getMonth() - 2)
        break
      case '3months':
        startDate = new Date(today)
        startDate.setMonth(startDate.getMonth() - 3)
        break
    }
    
    // Filter rides within the date range - loop from last to first for optimization
    // Since rides are added chronologically, newest rides are at the end
    const filteredRides: RideRecord[] = []
    
    for (let i = allRides.length - 1; i >= 0; i--) {
      const ride = allRides[i]
      const rideDate = new Date(ride.rideTime)
      
      // For "today" period, compare by date string to handle timezone correctly
      if (reportPeriod === '1day') {
        const rideDateString = getDateString(rideDate)
        if (rideDateString === todayString) {
          filteredRides.unshift(ride)
        }
        // Don't break early for "today" - check all rides to be safe
        // (Rides might not be perfectly sorted or might have timezone issues)
      } else {
        // For other periods, use date comparison with early break optimization
        if (rideDate >= startDate && rideDate <= endDate) {
          filteredRides.unshift(ride)
        } else if (rideDate < startDate) {
          // If this ride is before startDate, all older rides (going backwards) will also be before startDate
          break
        }
        // If rideDate > endDate (future date), continue to next ride
      }
    }
    
    // Group rides by batch type and batch name
    const morningRides = filteredRides.filter(r => r.batchType === 'morning')
    const eveningRides = filteredRides.filter(r => r.batchType === 'evening')
    
    // Period label
    const periodLabels: Record<string, string> = {
      '1day': 'Today',
      '1week': 'Last 7 Days',
      '1month': 'Last 1 Month',
      '2months': 'Last 2 Months',
      '3months': 'Last 3 Months'
    }
    
    // Header with logo
    doc.setFillColor(26, 26, 46)
    const headerHeight = 48
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    
    // Add logo if loaded - preserve natural aspect ratio
    if (logoData && logoWidth > 0 && logoHeight > 0) {
      const targetHeight = 40 // Target height in PDF units
      const aspectRatio = logoWidth / logoHeight
      const targetWidth = targetHeight * aspectRatio
      const logoY = (headerHeight - targetHeight) / 2 // Center vertically
      doc.addImage(logoData, 'PNG', 8, logoY, targetWidth, targetHeight)
    }
    
    doc.setTextColor(212, 175, 55)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Equine Enclave', pageWidth / 2, 18, { align: 'center' })
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Rides Report - ${periodLabels[reportPeriod]}`, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(9)
    doc.text(`${startDate.toLocaleDateString('en-IN')} to ${now.toLocaleDateString('en-IN')}`, pageWidth / 2, 40, { align: 'center' })
    
    doc.setTextColor(0, 0, 0)
    let y = 58
    
    // Summary
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Rides: ${filteredRides.length}`, 20, y)
    doc.text(`Morning: ${morningRides.length}`, 80, y)
    doc.text(`Evening: ${eveningRides.length}`, 130, y)
    y += 15
    
    // Function to render batch rides
    const renderBatchRides = (rides: typeof filteredRides, batchLabel: string, iconColor: [number, number, number]) => {
      if (rides.length === 0) return
      
      // Check if we need a new page
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      // Batch header
      doc.setFillColor(...iconColor)
      doc.rect(20, y - 5, 4, 12, 'F')
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${batchLabel} (${rides.length} rides)`, 28, y + 3)
      y += 15
      
      // Table header
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setFillColor(245, 245, 245)
      doc.rect(20, y - 4, pageWidth - 40, 8, 'F')
      doc.text('Date', 22, y)
      doc.text('Time', 52, y)
      doc.text('Rider Name', 80, y)
      doc.text('Level', 130, y)
      doc.text('Horse', 160, y)
      y += 8
      
      // Sort rides by date descending
      const sortedRides = [...rides].sort((a, b) => 
        new Date(b.rideTime).getTime() - new Date(a.rideTime).getTime()
      )
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      
      sortedRides.forEach((ride) => {
        if (y > 280) {
          doc.addPage()
          y = 20
          // Re-add header on new page
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setFillColor(245, 245, 245)
          doc.rect(20, y - 4, pageWidth - 40, 8, 'F')
          doc.text('Date', 22, y)
          doc.text('Time', 52, y)
          doc.text('Rider Name', 80, y)
          doc.text('Level', 130, y)
          doc.text('Horse', 160, y)
          y += 8
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
        }
        
        const rideDate = new Date(ride.rideTime)
        const dateStr = rideDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        const timeStr = rideDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        
        doc.text(dateStr, 22, y)
        doc.text(timeStr, 52, y)
        doc.text(ride.riderName.substring(0, 20), 80, y)
        doc.text(ride.riderLevel.charAt(0).toUpperCase() + ride.riderLevel.slice(1), 130, y)
        doc.text(ride.horse.substring(0, 15), 160, y)
        y += 6
      })
      
      y += 10
    }
    
    // Render morning rides
    renderBatchRides(morningRides, 'Morning Batch', [243, 156, 18])
    
    // Render evening rides
    renderBatchRides(eveningRides, 'Evening Batch', [155, 89, 182])
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Generated on ${new Date().toLocaleString('en-IN')} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      )
    }
    
    // Save
    const fileName = `rides_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    showToast('Report downloaded successfully!', 'success')
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
      if (batch?.riders) {
        batch.riders.forEach(rider => {
          allRiders.push({
            rider,
            batchType: 'morning',
            batchIndex: idx,
            batchName: batch.name || '',
            batchTime: batch.time || ''
          })
        })
      }
    })

    eveningBatches.forEach((batch, idx) => {
      if (batch?.riders) {
        batch.riders.forEach(rider => {
          allRiders.push({
            rider,
            batchType: 'evening',
            batchIndex: idx,
            batchName: batch.name || '',
            batchTime: batch.time || ''
          })
        })
      }
    })

    return allRiders
  }

  // Delete a rider
  const handleDeleteRider = async () => {
    if (!deleteModal.rider) return
    
    const riderId = deleteModal.rider.id
    const riderName = deleteModal.rider.name
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
        showToast(`${riderName} removed successfully!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to remove rider', 'error')
      }
    } catch (err) {
      console.error('Error deleting rider:', err)
      setLoading(false)
      showToast('Failed to remove rider', 'error')
    }
  }

  // Open edit modal with rider data
  const openEditModal = (rider: Rider, batchType: 'morning' | 'evening', batchIndex: number) => {
    setEditRiderData({
      name: rider.name,
      age: rider.age.toString(),
      phone: rider.phone,
      email: rider.email,
      level: rider.level,
      gender: rider.gender
    })
    setEditRiderModal({ isOpen: true, rider, batchType, batchIndex })
  }

  // Save edited rider
  const handleSaveEdit = async () => {
    if (!editRiderModal.rider) return
    
    const riderId = editRiderModal.rider.id
    const riderName = editRiderData.name
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editRiderData.name,
          age: parseInt(editRiderData.age),
          phone: editRiderData.phone,
          email: editRiderData.email,
          level: editRiderData.level,
          gender: editRiderData.gender
        })
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
        showToast(`${riderName} updated successfully!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to update rider', 'error')
      }
    } catch (err) {
      console.error('Error updating rider:', err)
      setLoading(false)
      showToast('Failed to update rider', 'error')
    }
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
      acc + (batch?.riders?.filter(r => needsToPay(r))?.length || 0), 0)
    const eveningDue = eveningBatches.reduce((acc, batch) => 
      acc + (batch?.riders?.filter(r => needsToPay(r))?.length || 0), 0)
    return morningDue + eveningDue
  }

  // Function to handle payment and deduct 26 classes
  const handlePayment = async () => {
    if (!paymentModal.rider) return
    
    const riderId = paymentModal.rider.id
    const riderName = paymentModal.rider.name
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}/pay`, {
        method: 'PATCH'
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })
        showToast(`Payment recorded for ${riderName}!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to process payment', 'error')
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      setLoading(false)
      showToast('Failed to process payment', 'error')
    }
  }

  // Function to select target batch (shows confirmation)
  const selectTargetBatch = (targetBatchType: 'morning' | 'evening', targetBatchIndex: number) => {
    const { sourceBatchType, sourceBatchIndex } = assignBatchModal
    
    // Don't do anything if selecting the same batch
    if (sourceBatchType === targetBatchType && sourceBatchIndex === targetBatchIndex) {
      return
    }
    
    setAssignBatchModal(prev => ({
      ...prev,
      targetBatchType,
      targetBatchIndex,
      isConfirming: true
    }))
  }

  // Function to confirm and move rider to the selected batch
  const confirmMoveToBatch = async () => {
    if (!assignBatchModal.rider || assignBatchModal.targetBatchType === null || assignBatchModal.targetBatchIndex === null) return
    
    const rider = assignBatchModal.rider
    const { targetBatchType, targetBatchIndex } = assignBatchModal
    
    // Set loading state
    setAssignBatchModal(prev => ({ ...prev, isMoving: true }))
    
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
        showToast(`${rider.name} moved successfully!`, 'success')
      } else {
        showToast(result.message || 'Failed to move rider', 'error')
      }
    } catch (err) {
      console.error('Error moving rider:', err)
      showToast('Failed to move rider', 'error')
    }
    
    setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })
  }

  // Function to cancel batch move confirmation
  const cancelMoveConfirmation = () => {
    setAssignBatchModal(prev => ({
      ...prev,
      targetBatchType: null,
      targetBatchIndex: null,
      isConfirming: false
    }))
  }

  // Function to add a new rider
  const handleAddRider = async () => {
    // Validate fields
    const errors: { name?: string; age?: string; phone?: string } = {}
    if (!newRider.name.trim()) errors.name = 'Name is required'
    if (!newRider.age) errors.age = 'Age is required'
    if (!newRider.phone.trim()) errors.phone = 'Phone is required'
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, addRider: errors }))
      return
    }

    setFormErrors(prev => ({ ...prev, addRider: {} }))
    setLoading(true)
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
          gender: newRider.gender,
          batchType: newRider.batchType,
          batchIndex: newRider.batchIndex
        })
      })
      const result = await response.json()
      
      if (result.success) {
        const riderName = newRider.name
        await fetchBatches() // Refresh data
        // Reset form and close modal
        setNewRider({
          name: '',
          age: '',
          phone: '',
          email: '',
          level: 'beginner',
          gender: 'male',
          batchType: 'morning',
          batchIndex: 0
        })
        setAddRiderModal(false)
        showToast(`${riderName} added successfully!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to add rider', 'error')
      }
    } catch (err) {
      console.error('Error adding rider:', err)
      setLoading(false)
      showToast('Failed to add rider. Please try again.', 'error')
    }
  }

  // Function to handle check-in (increment active classes)
  const handleCheckin = async () => {
    if (!checkinModal.rider) return
    
    // Validate horse selection
    if (!checkinModal.selectedHorse) {
      setFormErrors(prev => ({ ...prev, checkin: { horse: 'Please select a horse' } }))
      return
    }
    
    const riderId = checkinModal.rider.id
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/riders/${riderId}/checkin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          horse: checkinModal.selectedHorse
        })
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchBatches() // Refresh data
        await fetchTodayCheckins() // Refresh today's check-ins count
        setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0, selectedHorse: '' })
        setHorseDropdownOpen(false)
        setFormErrors(prev => ({ ...prev, checkin: {} }))
        showToast(`${checkinModal.rider?.name} checked in successfully!`, 'success')
      } else {
        setLoading(false)
        showToast(result.message || 'Failed to check in rider', 'error')
      }
    } catch (err) {
      console.error('Error checking in rider:', err)
      setLoading(false)
      showToast('Failed to check in rider. Please try again.', 'error')
      alert('Failed to check in rider')
    }
  }

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    )
  }

  const getTotalRiders = () => {
    const morningTotal = morningBatches.reduce((acc, batch) => acc + (batch?.riders?.length || 0), 0)
    const eveningTotal = eveningBatches.reduce((acc, batch) => acc + (batch?.riders?.length || 0), 0)
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
              <span className="quick-action__icon"><HorseIcon size={20} /></span>
              <span className="quick-action__label">Add Horse</span>
            </button>
            <button className="quick-action" onClick={() => setActiveTab('riders')}>
              <span className="quick-action__icon"><RiderIcon size={20} /></span>
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
                <HorseIcon size={32} />
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
          <div className="riders-stat__values">
            <span className="riders-stat__value">{morningBatches.reduce((acc, b) => acc + (b?.riders?.length || 0), 0)}</span>
            <span className="riders-stat__checkin" title="Checked in today">({todayCheckins.morning} today)</span>
          </div>
          <span className="riders-stat__label">Morning Batch</span>
        </div>
        <div className="riders-stat riders-stat--evening">
          <div className="riders-stat__values">
            <span className="riders-stat__value">{eveningBatches.reduce((acc, b) => acc + (b?.riders?.length || 0), 0)}</span>
            <span className="riders-stat__checkin" title="Checked in today">({todayCheckins.evening} today)</span>
          </div>
          <span className="riders-stat__label">Evening Batch</span>
        </div>
      </div>

      {/* Filters */}
      <div className="riders-filters">
        <span className="riders-filters__label">Filter:</span>
        <div className="riders-filters__buttons">
          <button 
            className={`filter-btn ${riderFilter === 'all' ? 'filter-btn--active' : ''}`}
            onClick={() => { setRiderFilter('all'); setSelectedRiderId(null); setTableSearchFilter(''); }}
          >
            All Riders
          </button>
          <button 
            className={`filter-btn ${riderFilter === 'payment-due' ? 'filter-btn--active' : ''}`}
            onClick={() => { setRiderFilter('payment-due'); setSelectedRiderId(null); setTableSearchFilter(''); }}
          >
            Payment Due ({getPaymentDueCount()})
          </button>
          <button 
            className={`filter-btn ${riderFilter === 'all-details' ? 'filter-btn--active' : ''}`}
            onClick={() => { setRiderFilter('all-details'); setSelectedRiderId(null); setTableSearchFilter(''); }}
          >
            Show All Rider Details
          </button>
        </div>
      </div>

      {/* All Rider Details View */}
      {riderFilter === 'all-details' && (
        <div className="all-riders-section">
          <div className="all-riders-header">
            <h3 className="all-riders-title">
              📋 {selectedRiderId ? 'Rider Details' : tableSearchFilter ? `Search Results for "${tableSearchFilter}"` : 'All Rider Details'}
            </h3>
            {(selectedRiderId || tableSearchFilter) ? (
              <button 
                className="clear-filter-btn"
                onClick={() => { setSelectedRiderId(null); setTableSearchFilter(''); }}
              >
                ✕ Clear Filter - Show All Riders
              </button>
            ) : (
              <span className="all-riders-count">{getAllRidersWithBatchInfo().length} riders</span>
            )}
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
                {getAllRidersWithBatchInfo()
                  .filter(({ rider }) => {
                    if (selectedRiderId) return rider.id === selectedRiderId
                    if (tableSearchFilter) {
                      const searchLower = tableSearchFilter.toLowerCase()
                      return (
                        rider.name.toLowerCase().includes(searchLower) ||
                        rider.phone.includes(tableSearchFilter) ||
                        rider.email.toLowerCase().includes(searchLower)
                      )
                    }
                    return true
                  })
                  .map(({ rider, batchType, batchIndex, batchName }) => (
                  <tr key={rider.id} className={selectedRiderId === rider.id ? 'highlighted-row' : ''}>
                    <td>
                      <div className="rider-name">
                        {isRiderInSession(rider) && <span className="session-indicator session-indicator--active" title="Currently in session"></span>}
                        {!isRiderInSession(rider) && hasRiddenToday(rider) && <span className="session-indicator session-indicator--completed" title="Completed ride today"></span>}
                        {rider.name}
                      </div>
                    </td>
                    <td>{rider.age} yrs</td>
                    <td>
                      <span className="batch-tag">
                        {batchType === 'morning' ? <WbSunnyIcon style={{ fontSize: 14, color: '#f39c12', marginRight: 4 }} /> : <NightsStayIcon style={{ fontSize: 14, color: '#9b59b6', marginRight: 4 }} />} {batchType.charAt(0).toUpperCase() + batchType.slice(1)} - {batchName}
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
                        <button 
                          className="export-btn"
                          onClick={() => exportRiderPDF(rider, batchType, batchIndex).catch(console.error)}
                          title="Export PDF"
                        >
                          Export
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
          <span className="batch-section__icon batch-section__icon--morning"><WbSunnyIcon /></span>
          <h2 className="batch-section__title">Morning Batches</h2>
          <span className="batch-section__count">{morningBatches.length} batches</span>
          <button 
            className="add-batch-btn"
            onClick={() => setAddBatchModal({ isOpen: true, batchType: 'morning', name: '', time: '' })}
          >
            + Add Batch
          </button>
        </div>

        <div className="batches-container">
          {morningBatches.filter(batch => batch != null).map((batch, index) => {
            const batchId = `morning-batch${index + 1}`
            const isExpanded = expandedBatches.includes(batchId)
            return (
              <div key={batchId} className={`batch-card ${isExpanded ? 'batch-card--expanded' : ''}`}>
                <div className="batch-card__header" onClick={() => toggleBatch(batchId)}>
                  <div className="batch-card__info">
                    <h3 className="batch-card__name">{batch.name}</h3>
                    <span className="batch-card__time">
                      <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {batch.time}
                    </span>
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
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    {index >= 3 && (
                      <button 
                        className="batch-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteBatchModal({ isOpen: true, batch, batchType: 'morning' })
                        }}
                        title="Delete batch"
                      >
                        🗑️
                      </button>
                    )}
                    <span className={`batch-card__rider-count ${isBatchFull(batch) ? 'batch-card__rider-count--full' : ''}`}>
                      {batch.riders.length}/{maxPersonsPerBatch}
                      {riderFilter === 'payment-due' && filterRiders(batch.riders).length !== batch.riders.length && 
                        ` (${filterRiders(batch.riders).length} due)`
                      }
                      {isBatchFull(batch) && ' • Full'}
                    </span>
                    <span className={`batch-card__toggle ${isExpanded ? 'batch-card__toggle--open' : ''}`}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="batch-card__content">
                    {filterRiders(batch.riders).length === 0 ? (
                      <div className="no-riders-message">
                        No riders with payment due in this batch
                      </div>
                    ) : (
                      <div className="riders-table-wrapper">
                      <table className="riders-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>                            
                            <th>Level</th>
                            <th>Joined</th>
                            <th>Active Classes</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filterRiders(batch.riders).map((rider) => (
                            <tr key={rider.id}>
                              <td>
                                <div className="rider-name">
                                  <span className="rider-name__row">
                                    {isRiderInSession(rider) && <span className="session-indicator session-indicator--active" title="Currently in session"></span>}
                                    {!isRiderInSession(rider) && hasRiddenToday(rider) && <span className="session-indicator session-indicator--completed" title="Completed ride today"></span>}
                                    {rider.name}
                                  </span>
                                  {getTodayCheckinHorse(rider) && (
                                    <span className="rider-horse-today">{getTodayCheckinHorse(rider)}</span>
                                  )}
                                </div>
                              </td>
                              <td>{rider.age} yrs</td>
                              <td>
                                <span className={`level-badge level-badge--${rider.level}`}>
                                  {rider.level}
                                </span>
                              </td>
                              <td title={rider.joinedDate}>{formatJoinedDate(rider.joinedDate)}</td>
                              <td>
                                <span className={`active-classes ${needsToPay(rider) ? 'active-classes--warning' : ''}`}>
                                  {rider.activeClassesCount} classes
                                </span>
                              </td>
                              <td>
                                <div className="rider-actions">
                                  <button 
                                    className={`checkin-btn ${hasCheckedInToday(rider) ? 'checkin-btn--again' : ''}`}
                                    onClick={() => setCheckinModal({ isOpen: true, rider, batchType: 'morning', batchIndex: index, selectedHorse: '' })}
                                    title={hasCheckedInToday(rider) ? "Already checked in today" : "Check-in"}
                                  >
                                    {hasCheckedInToday(rider) ? 'Check-in Again' : 'Check-in'}
                                  </button>
                                  <button 
                                    className="assign-btn"
                                    onClick={() => setAssignBatchModal({ isOpen: true, rider, sourceBatchType: 'morning', sourceBatchIndex: index, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })}
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
                                  <button 
                                    className="export-btn"
                                    onClick={() => exportRiderPDF(rider, 'morning', index).catch(console.error)}
                                    title="Export PDF"
                                  >
                                    Export
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
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
          <span className="batch-section__icon batch-section__icon--evening"><NightsStayIcon /></span>
          <h2 className="batch-section__title">Evening Batches</h2>
          <span className="batch-section__count">{eveningBatches.length} batches</span>
          <button 
            className="add-batch-btn"
            onClick={() => setAddBatchModal({ isOpen: true, batchType: 'evening', name: '', time: '' })}
          >
            + Add Batch
          </button>
        </div>

        <div className="batches-container">
          {eveningBatches.filter(batch => batch != null).map((batch, index) => {
            const batchId = `evening-batch${index + 1}`
            const isExpanded = expandedBatches.includes(batchId)
            return (
              <div key={batchId} className={`batch-card ${isExpanded ? 'batch-card--expanded' : ''}`}>
                <div className="batch-card__header" onClick={() => toggleBatch(batchId)}>
                  <div className="batch-card__info">
                    <h3 className="batch-card__name">{batch.name}</h3>
                    <span className="batch-card__time">
                      <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {batch.time}
                    </span>
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
                      <EditIcon style={{ fontSize: 18 }} />
                    </button>
                    {index >= 3 && (
                      <button 
                        className="batch-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteBatchModal({ isOpen: true, batch, batchType: 'evening' })
                        }}
                        title="Delete batch"
                      >
                        🗑️
                      </button>
                    )}
                    <span className={`batch-card__rider-count ${isBatchFull(batch) ? 'batch-card__rider-count--full' : ''}`}>
                      {batch.riders.length}/{maxPersonsPerBatch}
                      {riderFilter === 'payment-due' && filterRiders(batch.riders).length !== batch.riders.length && 
                        ` (${filterRiders(batch.riders).length} due)`
                      }
                      {isBatchFull(batch) && ' • Full'}
                    </span>
                    <span className={`batch-card__toggle ${isExpanded ? 'batch-card__toggle--open' : ''}`}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="batch-card__content">
                    {filterRiders(batch.riders).length === 0 ? (
                      <div className="no-riders-message">
                        No riders with payment due in this batch
                      </div>
                    ) : (
                      <div className="riders-table-wrapper">
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
                                  <span className="rider-name__row">
                                    {isRiderInSession(rider) && <span className="session-indicator session-indicator--active" title="Currently in session"></span>}
                                    {!isRiderInSession(rider) && hasRiddenToday(rider) && <span className="session-indicator session-indicator--completed" title="Completed ride today"></span>}
                                    {rider.name}
                                  </span>
                                  {getTodayCheckinHorse(rider) && (
                                    <span className="rider-horse-today">{getTodayCheckinHorse(rider)}</span>
                                  )}
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
                                    className={`checkin-btn ${hasCheckedInToday(rider) ? 'checkin-btn--again' : ''}`}
                                    onClick={() => setCheckinModal({ isOpen: true, rider, batchType: 'evening', batchIndex: index, selectedHorse: '' })}
                                    title={hasCheckedInToday(rider) ? "Already checked in today" : "Check-in"}
                                  >
                                    {hasCheckedInToday(rider) ? 'Check-in Again' : 'Check-in'}
                                  </button>
                                  <button 
                                    className="assign-btn"
                                    onClick={() => setAssignBatchModal({ isOpen: true, rider, sourceBatchType: 'evening', sourceBatchIndex: index, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })}
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
                                  <button 
                                    className="export-btn"
                                    onClick={() => exportRiderPDF(rider, 'evening', index).catch(console.error)}
                                    title="Export PDF"
                                  >
                                    Export
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
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

      {/* Add Rider Button - Hide when any modal is open */}
      {!paymentModal.isOpen && 
       !checkinModal.isOpen && 
       !deleteModal.isOpen && 
       !editRiderModal.isOpen && 
       !editBatchModal.isOpen && 
       !deleteBatchModal.isOpen && 
       !addBatchModal.isOpen && 
       !addRiderModal && 
       !assignBatchModal.isOpen && (
        <button className="add-rider-btn" onClick={() => setAddRiderModal(true)}>
          <span>➕</span>
          Add New Rider
        </button>
      )}

      {/* Check-in Confirmation Modal */}
      {checkinModal.isOpen && checkinModal.rider && (
        <div className="modal-overlay" onClick={() => { if (!loading) { setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0, selectedHorse: '' }); setHorseDropdownOpen(false); setFormErrors(prev => ({ ...prev, checkin: {} })); }}}>
          <div className="modal modal--checkin" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">✅ Confirm Check-in</h2>
              <button 
                className="modal__close"
                onClick={() => { if (!loading) { setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0, selectedHorse: '' }); setHorseDropdownOpen(false); setFormErrors(prev => ({ ...prev, checkin: {} })); }}}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
                <div className="modal__rider-details">
                  <h3 className="modal__rider-name">{checkinModal.rider.name}</h3>
                  <p className="modal__rider-meta">
                    {checkinModal.rider.level} • {checkinModal.batchType === 'morning' ? <><WbSunnyIcon style={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', marginRight: 2 }} /> Morning</> : <><NightsStayIcon style={{ fontSize: 14, color: '#9b59b6', verticalAlign: 'middle', marginRight: 2 }} /> Evening</>} {
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

              <div className={`form-field ${formErrors.checkin.horse ? 'form-field--error' : ''}`}>
                <label>Select Horse *</label>
                <div className="horse-dropdown">
                  <div 
                    className={`horse-dropdown__trigger ${horseDropdownOpen ? 'horse-dropdown__trigger--open' : ''} ${loading ? 'horse-dropdown__trigger--disabled' : ''}`}
                    onClick={() => !loading && setHorseDropdownOpen(!horseDropdownOpen)}
                  >
                    <span className={`horse-dropdown__value ${!checkinModal.selectedHorse ? 'horse-dropdown__value--placeholder' : ''}`}>
                      {checkinModal.selectedHorse || '-- Select a horse --'}
                    </span>
                    <span className="horse-dropdown__arrow">▼</span>
                  </div>
                  {horseDropdownOpen && (
                    <>
                      <div 
                        className="horse-dropdown__overlay" 
                        onClick={() => setHorseDropdownOpen(false)}
                      />
                      <div className="horse-dropdown__menu">
                        {horses?.map(horse => (
                          <div
                            key={horse.id}
                            className={`horse-dropdown__item ${checkinModal.selectedHorse === horse.name ? 'horse-dropdown__item--selected' : ''}`}
                            onClick={() => {
                              setCheckinModal(prev => ({ ...prev, selectedHorse: horse.name }))
                              setHorseDropdownOpen(false)
                              if (formErrors.checkin.horse) {
                                setFormErrors(prev => ({ ...prev, checkin: {} }))
                              }
                            }}
                          >
                            <span className="horse-dropdown__item-name">{horse.name}</span>
                            <span className="horse-dropdown__item-breed">{horse.breed}</span>
                            {checkinModal.selectedHorse === horse.name && <span className="horse-dropdown__check">✓</span>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {formErrors.checkin.horse && <span className="form-field__error">{formErrors.checkin.horse}</span>}
              </div>

              <p className="modal__message">
                Confirm check-in for <strong>{checkinModal.rider.name}</strong>? This will add 1 class to their active classes count.
              </p>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => { setCheckinModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0, selectedHorse: '' }); setHorseDropdownOpen(false); setFormErrors(prev => ({ ...prev, checkin: {} })); }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--checkin ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleCheckin}
                disabled={loading || !checkinModal.selectedHorse}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Checking in...' : '✓ Confirm Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Rider Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.rider && (
        <div className="modal-overlay" onClick={() => !loading && setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}>
          <div className="modal modal--delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">⚠️ Remove Rider</h2>
              <button 
                className="modal__close"
                onClick={() => !loading && setDeleteModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
                <div className="modal__rider-details">
                  <h3 className="modal__rider-name">{deleteModal.rider.name}</h3>
                  <p className="modal__rider-meta">
                    {deleteModal.batchType === 'morning' ? <><WbSunnyIcon style={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', marginRight: 2 }} /> Morning</> : <><NightsStayIcon style={{ fontSize: 14, color: '#9b59b6', verticalAlign: 'middle', marginRight: 2 }} /> Evening</>} - {
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
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--danger ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleDeleteRider}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Removing...' : 'Remove Rider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rider Modal */}
      {editRiderModal.isOpen && editRiderModal.rider && (
        <div className="modal-overlay" onClick={() => { if (!loading) { setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 }); setEditLevelDropdownOpen(false); }}}>
          <div className="modal modal--edit-rider" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Edit Rider</h2>
              <button 
                className="modal__close"
                onClick={() => { if (!loading) { setEditRiderModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 }); setEditLevelDropdownOpen(false); }}}
                disabled={loading}
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

                <div className="form-row">
                  <div className="form-field">
                    <label>Skill Level</label>
                    <div className="level-dropdown">
                      <div 
                        className={`level-dropdown__trigger ${editLevelDropdownOpen ? 'level-dropdown__trigger--open' : ''}`}
                        onClick={() => setEditLevelDropdownOpen(!editLevelDropdownOpen)}
                      >
                        <span className="level-dropdown__value">
                          {editRiderData.level.charAt(0).toUpperCase() + editRiderData.level.slice(1)}
                        </span>
                        <span className="level-dropdown__arrow">▼</span>
                      </div>
                      {editLevelDropdownOpen && (
                        <>
                          <div 
                            className="level-dropdown__overlay" 
                            onClick={() => setEditLevelDropdownOpen(false)}
                          />
                          <div className="level-dropdown__menu">
                            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                              <div
                                key={level}
                                className={`level-dropdown__item ${editRiderData.level === level ? 'level-dropdown__item--selected' : ''}`}
                                onClick={() => {
                                  setEditRiderData(prev => ({ ...prev, level }))
                                  setEditLevelDropdownOpen(false)
                                }}
                              >
                                <span className="level-dropdown__item-name">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                {editRiderData.level === level && <span className="level-dropdown__check">✓</span>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Gender *</label>
                    <div className="gender-dropdown">
                      <div 
                        className={`gender-dropdown__trigger ${editGenderDropdownOpen ? 'gender-dropdown__trigger--open' : ''}`}
                        onClick={() => setEditGenderDropdownOpen(!editGenderDropdownOpen)}
                      >
                        <span className="gender-dropdown__value">
                          {editRiderData.gender.charAt(0).toUpperCase() + editRiderData.gender.slice(1)}
                        </span>
                        <span className="gender-dropdown__arrow">▼</span>
                      </div>
                      {editGenderDropdownOpen && (
                        <>
                          <div 
                            className="gender-dropdown__overlay" 
                            onClick={() => setEditGenderDropdownOpen(false)}
                          />
                          <div className="gender-dropdown__menu">
                            {(['male', 'female'] as const).map(gender => (
                              <div
                                key={gender}
                                className={`gender-dropdown__item ${editRiderData.gender === gender ? 'gender-dropdown__item--selected' : ''}`}
                                onClick={() => {
                                  setEditRiderData(prev => ({ ...prev, gender }))
                                  setEditGenderDropdownOpen(false)
                                }}
                              >
                                <span className="gender-dropdown__item-name">{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                                {editRiderData.gender === gender && <span className="gender-dropdown__check">✓</span>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--confirm ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleSaveEdit}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Timing Modal */}
      {editBatchModal.isOpen && (
        <div className="modal-overlay" onClick={() => {
          if (!loading) {
            setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })
            setFormErrors(prev => ({ ...prev, editBatch: {} }))
          }
        }}>
          <div className="modal modal--edit-batch" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                <svg className="modal__title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Edit Batch Timing
              </h2>
              <button 
                className="modal__close"
                onClick={() => {
                  if (!loading) {
                    setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })
                    setFormErrors(prev => ({ ...prev, editBatch: {} }))
                  }
                }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="edit-batch-info">
                <span className="edit-batch-type">
                  {editBatchModal.batchType === 'morning' ? <><WbSunnyIcon style={{ fontSize: 18, color: '#f39c12', verticalAlign: 'middle', marginRight: 4 }} /> Morning</> : <><NightsStayIcon style={{ fontSize: 18, color: '#9b59b6', verticalAlign: 'middle', marginRight: 4 }} /> Evening</>}
                </span>
              </div>
              <form className="edit-batch-form" onSubmit={(e) => { e.preventDefault(); handleSaveBatchTiming(); }}>
                <div className={`form-field ${formErrors.editBatch.name ? 'form-field--error' : ''}`}>
                  <label htmlFor="batch-name">Batch Name *</label>
                  <input
                    type="text"
                    id="batch-name"
                    value={editBatchModal.name}
                    onChange={(e) => {
                      setEditBatchModal(prev => ({ ...prev, name: e.target.value }))
                      if (formErrors.editBatch.name) setFormErrors(prev => ({ ...prev, editBatch: { ...prev.editBatch, name: undefined } }))
                    }}
                    placeholder="e.g., Batch 1"
                    disabled={loading}
                  />
                  {formErrors.editBatch.name && <span className="form-field__error">{formErrors.editBatch.name}</span>}
                </div>
                <div className={`form-field ${formErrors.editBatch.time ? 'form-field--error' : ''}`}>
                  <label htmlFor="batch-time">Timing *</label>
                  <input
                    type="text"
                    id="batch-time"
                    value={editBatchModal.time}
                    onChange={(e) => {
                      setEditBatchModal(prev => ({ ...prev, time: e.target.value }))
                      if (formErrors.editBatch.time) setFormErrors(prev => ({ ...prev, editBatch: { ...prev.editBatch, time: undefined } }))
                    }}
                    placeholder="e.g., 6:00 AM - 7:30 AM"
                    required
                    disabled={loading}
                  />
                  {formErrors.editBatch.time && <span className="form-field__error">{formErrors.editBatch.time}</span>}
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => {
                  setEditBatchModal({ isOpen: false, batchType: 'morning', batchIndex: 0, name: '', time: '' })
                  setFormErrors(prev => ({ ...prev, editBatch: {} }))
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--confirm ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleSaveBatchTiming}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Saving...' : 'Save Timing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Batch Confirmation Modal */}
      {deleteBatchModal.isOpen && deleteBatchModal.batch && (
        <div className="modal-overlay" onClick={() => !loading && setDeleteBatchModal({ isOpen: false, batch: null, batchType: 'morning' })}>
          <div className="modal modal--delete-batch" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">⚠️ Delete Batch</h2>
              <button 
                className="modal__close"
                onClick={() => !loading && setDeleteBatchModal({ isOpen: false, batch: null, batchType: 'morning' })}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="delete-batch-info">
                <span className="delete-batch-type">
                  {deleteBatchModal.batchType === 'morning' ? <><WbSunnyIcon style={{ fontSize: 18, color: '#f39c12', verticalAlign: 'middle', marginRight: 4 }} /> Morning</> : <><NightsStayIcon style={{ fontSize: 18, color: '#9b59b6', verticalAlign: 'middle', marginRight: 4 }} /> Evening</>}
                </span>
                <h3 className="delete-batch-name">{deleteBatchModal.batch.name}</h3>
                <p className="delete-batch-time">{deleteBatchModal.batch.time}</p>
              </div>
              {deleteBatchModal.batch.riders.length > 0 ? (
                <div className="delete-batch-warning">
                  <p>⚠️ This batch has <strong>{deleteBatchModal.batch.riders.length} rider(s)</strong> assigned.</p>
                  <p>Please move all riders to another batch before deleting.</p>
                </div>
              ) : (
                <p className="delete-batch-message">
                  Are you sure you want to delete this batch? This action cannot be undone.
                </p>
              )}
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => setDeleteBatchModal({ isOpen: false, batch: null, batchType: 'morning' })}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--danger ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleDeleteBatch}
                disabled={deleteBatchModal.batch.riders.length > 0 || loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Deleting...' : 'Delete Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Batch Modal */}
      {addBatchModal.isOpen && (
        <div className="modal-overlay" onClick={() => {
          if (!loading) {
            setAddBatchModal({ isOpen: false, batchType: 'morning', name: '', time: '' })
            setFormErrors(prev => ({ ...prev, addBatch: {} }))
          }
        }}>
          <div className="modal modal--add-batch" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">➕ Add New Batch</h2>
              <button 
                className="modal__close"
                onClick={() => {
                  if (!loading) {
                    setAddBatchModal({ isOpen: false, batchType: 'morning', name: '', time: '' })
                    setFormErrors(prev => ({ ...prev, addBatch: {} }))
                  }
                }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="edit-batch-info">
                <span className="edit-batch-type">
                  {addBatchModal.batchType === 'morning' ? <><WbSunnyIcon style={{ fontSize: 18, color: '#f39c12', verticalAlign: 'middle', marginRight: 4 }} /> Morning</> : <><NightsStayIcon style={{ fontSize: 18, color: '#9b59b6', verticalAlign: 'middle', marginRight: 4 }} /> Evening</>}
                </span>
              </div>
              <form className="edit-batch-form" onSubmit={(e) => { e.preventDefault(); handleAddBatch(); }}>
                <div className={`form-field ${formErrors.addBatch.name ? 'form-field--error' : ''}`}>
                  <label htmlFor="new-batch-name">Batch Name *</label>
                  <input
                    type="text"
                    id="new-batch-name"
                    value={addBatchModal.name}
                    onChange={(e) => {
                      setAddBatchModal(prev => ({ ...prev, name: e.target.value }))
                      if (formErrors.addBatch.name) setFormErrors(prev => ({ ...prev, addBatch: { ...prev.addBatch, name: undefined } }))
                    }}
                    placeholder="e.g., Batch 4, Weekend Special"
                    disabled={loading}
                  />
                  {formErrors.addBatch.name && <span className="form-field__error">{formErrors.addBatch.name}</span>}
                </div>
                <div className={`form-field ${formErrors.addBatch.time ? 'form-field--error' : ''}`}>
                  <label htmlFor="new-batch-time">Timing *</label>
                  <input
                    type="text"
                    id="new-batch-time"
                    value={addBatchModal.time}
                    onChange={(e) => {
                      setAddBatchModal(prev => ({ ...prev, time: e.target.value }))
                      if (formErrors.addBatch.time) setFormErrors(prev => ({ ...prev, addBatch: { ...prev.addBatch, time: undefined } }))
                    }}
                    placeholder="e.g., 10:30 AM - 12:00 PM"
                    disabled={loading}
                  />
                  {formErrors.addBatch.time && <span className="form-field__error">{formErrors.addBatch.time}</span>}
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => {
                  setAddBatchModal({ isOpen: false, batchType: 'morning', name: '', time: '' })
                  setFormErrors(prev => ({ ...prev, addBatch: {} }))
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--confirm ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleAddBatch}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Adding...' : 'Add Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Rider Modal */}
      {addRiderModal && (
        <div className="modal-overlay" onClick={() => {
          if (!loading) {
            setAddRiderModal(false)
            setLevelDropdownOpen(false)
            setFormErrors(prev => ({ ...prev, addRider: {} }))
          }
        }}>
          <div className="modal modal--add-rider" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Add New Rider</h2>
              <button 
                className="modal__close"
                onClick={() => {
                  if (!loading) {
                    setAddRiderModal(false)
                    setFormErrors(prev => ({ ...prev, addRider: {} }))
                  }
                }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <form className="add-rider-form" onSubmit={(e) => { e.preventDefault(); handleAddRider(); }}>
                <div className="form-row">
                  <div className={`form-field ${formErrors.addRider.name ? 'form-field--error' : ''}`}>
                    <label htmlFor="rider-name">Name *</label>
                    <input
                      type="text"
                      id="rider-name"
                      placeholder="Enter rider's name"
                      value={newRider.name}
                      onChange={(e) => {
                        setNewRider(prev => ({ ...prev, name: e.target.value }))
                        if (formErrors.addRider.name) setFormErrors(prev => ({ ...prev, addRider: { ...prev.addRider, name: undefined } }))
                      }}
                    />
                    {formErrors.addRider.name && <span className="form-field__error">{formErrors.addRider.name}</span>}
                  </div>
                  <div className={`form-field ${formErrors.addRider.age ? 'form-field--error' : ''}`}>
                    <label htmlFor="rider-age">Age *</label>
                    <input
                      type="number"
                      id="rider-age"
                      placeholder="Age"
                      min="5"
                      max="80"
                      value={newRider.age}
                      onChange={(e) => {
                        setNewRider(prev => ({ ...prev, age: e.target.value }))
                        if (formErrors.addRider.age) setFormErrors(prev => ({ ...prev, addRider: { ...prev.addRider, age: undefined } }))
                      }}
                    />
                    {formErrors.addRider.age && <span className="form-field__error">{formErrors.addRider.age}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-field ${formErrors.addRider.phone ? 'form-field--error' : ''}`}>
                    <label htmlFor="rider-phone">Phone *</label>
                    <input
                      type="tel"
                      id="rider-phone"
                      placeholder="+91 98765 43210"
                      value={newRider.phone}
                      onChange={(e) => {
                        setNewRider(prev => ({ ...prev, phone: e.target.value }))
                        if (formErrors.addRider.phone) setFormErrors(prev => ({ ...prev, addRider: { ...prev.addRider, phone: undefined } }))
                      }}
                    />
                    {formErrors.addRider.phone && <span className="form-field__error">{formErrors.addRider.phone}</span>}
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

                <div className="form-row">
                  <div className="form-field">
                    <label>Skill Level</label>
                    <div className="level-dropdown">
                      <div 
                        className={`level-dropdown__trigger ${levelDropdownOpen ? 'level-dropdown__trigger--open' : ''}`}
                        onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                      >
                        <span className="level-dropdown__value">
                          {newRider.level.charAt(0).toUpperCase() + newRider.level.slice(1)}
                        </span>
                        <span className="level-dropdown__arrow">▼</span>
                      </div>
                      {levelDropdownOpen && (
                        <>
                          <div 
                            className="level-dropdown__overlay" 
                            onClick={() => setLevelDropdownOpen(false)}
                          />
                          <div className="level-dropdown__menu">
                            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                              <div
                                key={level}
                                className={`level-dropdown__item ${newRider.level === level ? 'level-dropdown__item--selected' : ''}`}
                                onClick={() => {
                                  setNewRider(prev => ({ ...prev, level }))
                                  setLevelDropdownOpen(false)
                                }}
                              >
                                <span className="level-dropdown__item-name">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                {newRider.level === level && <span className="level-dropdown__check">✓</span>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Gender *</label>
                    <div className="gender-dropdown">
                      <div 
                        className={`gender-dropdown__trigger ${genderDropdownOpen ? 'gender-dropdown__trigger--open' : ''}`}
                        onClick={() => setGenderDropdownOpen(!genderDropdownOpen)}
                      >
                        <span className="gender-dropdown__value">
                          {newRider.gender.charAt(0).toUpperCase() + newRider.gender.slice(1)}
                        </span>
                        <span className="gender-dropdown__arrow">▼</span>
                      </div>
                      {genderDropdownOpen && (
                        <>
                          <div 
                            className="gender-dropdown__overlay" 
                            onClick={() => setGenderDropdownOpen(false)}
                          />
                          <div className="gender-dropdown__menu">
                            {(['male', 'female'] as const).map(gender => (
                              <div
                                key={gender}
                                className={`gender-dropdown__item ${newRider.gender === gender ? 'gender-dropdown__item--selected' : ''}`}
                                onClick={() => {
                                  setNewRider(prev => ({ ...prev, gender }))
                                  setGenderDropdownOpen(false)
                                }}
                              >
                                <span className="gender-dropdown__item-name">{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                                {newRider.gender === gender && <span className="gender-dropdown__check">✓</span>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <label>Assign to Batch *</label>
                  <div className="batch-select-grid">
                    <div className="batch-select-group">
                      <span className="batch-select-label"><WbSunnyIcon style={{ fontSize: 16, color: '#f39c12', verticalAlign: 'middle', marginRight: 4 }} /> Morning</span>
                      {morningBatches.filter(b => b != null).map((batch, idx) => {
                        const isFull = isBatchFull(batch)
                        return (
                          <label 
                            key={`morning-${idx}`} 
                            className={`batch-radio ${isFull ? 'batch-radio--disabled' : ''}`}
                            title={isFull ? `Batch full (${batch.riders.length}/${maxPersonsPerBatch})` : ''}
                          >
                            <input
                              type="radio"
                              name="batch"
                              checked={newRider.batchType === 'morning' && newRider.batchIndex === idx}
                              onChange={() => setNewRider(prev => ({ ...prev, batchType: 'morning', batchIndex: idx }))}
                              disabled={isFull}
                            />
                            <span className="batch-radio__content">
                              <span className="batch-radio__name">{batch.name}</span>
                              <span className="batch-radio__time">{batch.time}</span>
                              <span className={`batch-radio__capacity ${isFull ? 'batch-radio__capacity--full' : ''}`}>
                                {batch.riders.length}/{maxPersonsPerBatch}
                                {isFull && ' (Full)'}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="batch-select-group">
                      <span className="batch-select-label"><NightsStayIcon style={{ fontSize: 16, color: '#9b59b6', verticalAlign: 'middle', marginRight: 4 }} /> Evening</span>
                      {eveningBatches.filter(b => b != null).map((batch, idx) => {
                        const isFull = isBatchFull(batch)
                        return (
                          <label 
                            key={`evening-${idx}`} 
                            className={`batch-radio ${isFull ? 'batch-radio--disabled' : ''}`}
                            title={isFull ? `Batch full (${batch.riders.length}/${maxPersonsPerBatch})` : ''}
                          >
                            <input
                              type="radio"
                              name="batch"
                              checked={newRider.batchType === 'evening' && newRider.batchIndex === idx}
                              onChange={() => setNewRider(prev => ({ ...prev, batchType: 'evening', batchIndex: idx }))}
                              disabled={isFull}
                            />
                            <span className="batch-radio__content">
                              <span className="batch-radio__name">{batch.name}</span>
                              <span className="batch-radio__time">{batch.time}</span>
                              <span className={`batch-radio__capacity ${isFull ? 'batch-radio__capacity--full' : ''}`}>
                                {batch.riders.length}/{maxPersonsPerBatch}
                                {isFull && ' (Full)'}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal__footer">
              <button 
                className="modal__btn modal__btn--cancel"
                onClick={() => {
                  setAddRiderModal(false)
                  setFormErrors(prev => ({ ...prev, addRider: {} }))
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--confirm ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handleAddRider}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Adding...' : 'Add Rider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Batch Modal */}
      {assignBatchModal.isOpen && assignBatchModal.rider && (
        <div className="modal-overlay" onClick={() => !assignBatchModal.isMoving && setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })}>
          <div className="modal modal--assign" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{assignBatchModal.isConfirming ? '✅ Confirm Move' : '🔄 Move to Batch'}</h2>
              <button 
                className="modal__close"
                onClick={() => !assignBatchModal.isMoving && setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })}
                disabled={assignBatchModal.isMoving}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              {assignBatchModal.isMoving ? (
                <div className="move-loading">
                  <div className="move-loading__spinner"></div>
                  <p className="move-loading__text">Moving {assignBatchModal.rider.name}...</p>
                </div>
              ) : assignBatchModal.isConfirming && assignBatchModal.targetBatchType !== null && assignBatchModal.targetBatchIndex !== null ? (
                <>
                  <div className="modal__rider-info">
                    <div className="modal__rider-details">
                      <h3 className="modal__rider-name">{assignBatchModal.rider.name}</h3>
                    </div>
                  </div>
                  
                  <div className="move-confirmation">
                    <div className="move-confirmation__from">
                      <span className="move-confirmation__label">From</span>
                      <span className="move-confirmation__batch">
                        {assignBatchModal.sourceBatchType === 'morning' ? <WbSunnyIcon style={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', marginRight: 4 }} /> : <NightsStayIcon style={{ fontSize: 14, color: '#9b59b6', verticalAlign: 'middle', marginRight: 4 }} />} {
                          assignBatchModal.sourceBatchType === 'morning' 
                            ? morningBatches[assignBatchModal.sourceBatchIndex]?.name 
                            : eveningBatches[assignBatchModal.sourceBatchIndex]?.name
                        }
                      </span>
                    </div>
                    <div className="move-confirmation__arrow">→</div>
                    <div className="move-confirmation__to">
                      <span className="move-confirmation__label">To</span>
                      <span className="move-confirmation__batch">
                        {assignBatchModal.targetBatchType === 'morning' ? <WbSunnyIcon style={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', marginRight: 4 }} /> : <NightsStayIcon style={{ fontSize: 14, color: '#9b59b6', verticalAlign: 'middle', marginRight: 4 }} />} {
                          assignBatchModal.targetBatchType === 'morning' 
                            ? morningBatches[assignBatchModal.targetBatchIndex]?.name 
                            : eveningBatches[assignBatchModal.targetBatchIndex]?.name
                        }
                      </span>
                    </div>
                  </div>

                  <p className="modal__message">
                    Are you sure you want to move <strong>{assignBatchModal.rider.name}</strong> to this batch?
                  </p>
                </>
              ) : (
                <>
                  <div className="modal__rider-info">
                    <div className="modal__rider-details">
                      <h3 className="modal__rider-name">{assignBatchModal.rider.name}</h3>
                      <p className="modal__rider-meta">
                        Currently in: {assignBatchModal.sourceBatchType === 'morning' ? <><WbSunnyIcon style={{ fontSize: 14, color: '#f39c12', verticalAlign: 'middle', marginRight: 2 }} /> Morning</> : <><NightsStayIcon style={{ fontSize: 14, color: '#9b59b6', verticalAlign: 'middle', marginRight: 2 }} /> Evening</>} - {
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
                      <h5 className="batch-selection__group-title"><WbSunnyIcon style={{ fontSize: 18, color: '#f39c12', marginRight: 6 }} /> Morning Batches</h5>
                      <div className="batch-selection__options">
                        {morningBatches.filter(b => b != null).map((batch, idx) => {
                          const isCurrent = assignBatchModal.sourceBatchType === 'morning' && assignBatchModal.sourceBatchIndex === idx
                          const isFull = isBatchFull(batch)
                          return (
                            <button
                              key={`morning-${idx}`}
                              className={`batch-option ${isCurrent ? 'batch-option--current' : ''} ${isFull && !isCurrent ? 'batch-option--full' : ''}`}
                              onClick={() => selectTargetBatch('morning', idx)}
                              disabled={isCurrent || isFull}
                            >
                              <span className="batch-option__name">{batch.name}</span>
                              <span className="batch-option__time">{batch.time}</span>
                              <span className={`batch-option__count ${isFull ? 'batch-option__count--full' : ''}`}>
                                {batch.riders.length}/{maxPersonsPerBatch}
                              </span>
                              {isCurrent && <span className="batch-option__current-tag">Current</span>}
                              {isFull && !isCurrent && <span className="batch-option__full-tag">Full</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    
                    <div className="batch-selection__group">
                      <h5 className="batch-selection__group-title"><NightsStayIcon style={{ fontSize: 18, color: '#9b59b6', marginRight: 6 }} /> Evening Batches</h5>
                      <div className="batch-selection__options">
                        {eveningBatches.filter(b => b != null).map((batch, idx) => {
                          const isCurrent = assignBatchModal.sourceBatchType === 'evening' && assignBatchModal.sourceBatchIndex === idx
                          const isFull = isBatchFull(batch)
                          return (
                            <button
                              key={`evening-${idx}`}
                              className={`batch-option ${isCurrent ? 'batch-option--current' : ''} ${isFull && !isCurrent ? 'batch-option--full' : ''}`}
                              onClick={() => selectTargetBatch('evening', idx)}
                              disabled={isCurrent || isFull}
                            >
                              <span className="batch-option__name">{batch.name}</span>
                              <span className="batch-option__time">{batch.time}</span>
                              <span className={`batch-option__count ${isFull ? 'batch-option__count--full' : ''}`}>
                                {batch.riders.length}/{maxPersonsPerBatch}
                              </span>
                              {isCurrent && <span className="batch-option__current-tag">Current</span>}
                              {isFull && !isCurrent && <span className="batch-option__full-tag">Full</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal__footer">
              {assignBatchModal.isMoving ? (
                <span className="modal__loading-text">Please wait...</span>
              ) : assignBatchModal.isConfirming ? (
                <>
                  <button 
                    className="modal__btn modal__btn--cancel"
                    onClick={cancelMoveConfirmation}
                  >
                    Back
                  </button>
                  <button 
                    className="modal__btn modal__btn--confirm"
                    onClick={confirmMoveToBatch}
                  >
                    Confirm Move
                  </button>
                </>
              ) : (
                <button 
                  className="modal__btn modal__btn--cancel"
                  onClick={() => setAssignBatchModal({ isOpen: false, rider: null, sourceBatchType: 'morning', sourceBatchIndex: 0, targetBatchType: null, targetBatchIndex: null, isConfirming: false, isMoving: false })}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {paymentModal.isOpen && paymentModal.rider && (
        <div className="modal-overlay" onClick={() => !loading && setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">💰 Confirm Payment</h2>
              <button 
                className="modal__close"
                onClick={() => !loading && setPaymentModal({ isOpen: false, rider: null, batchType: 'morning', batchIndex: 0 })}
                disabled={loading}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__rider-info">
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
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`modal__btn modal__btn--confirm ${loading ? 'modal__btn--loading' : ''}`}
                onClick={handlePayment}
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {loading ? 'Processing...' : 'Mark as Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Calculate horse analytics from rides data
  const calculateHorseAnalytics = (): HorseAnalytics[] => {
    const horseMap = new Map<string, HorseAnalytics>()
    
    // Get unique horses from the horses array
    horses.forEach(horse => {
      horseMap.set(horse.name, {
        horseName: horse.name,
        totalRides: 0,
        beginnerRides: 0,
        intermediateRides: 0,
        advancedRides: 0,
        totalHours: 0,
        beginnerHours: 0,
        intermediateHours: 0,
        advancedHours: 0
      })
    })
    
    // Calculate analytics from rides
    allRides.forEach(ride => {
      const analytics = horseMap.get(ride.horse)
      if (analytics) {
        analytics.totalRides++
        analytics.totalHours += 0.75 // 45 mins = 0.75 hours
        
        if (ride.riderLevel === 'beginner') {
          analytics.beginnerRides++
          analytics.beginnerHours += 0.75
        } else if (ride.riderLevel === 'intermediate') {
          analytics.intermediateRides++
          analytics.intermediateHours += 0.75
        } else if (ride.riderLevel === 'advanced') {
          analytics.advancedRides++
          analytics.advancedHours += 0.75
        }
      }
    })
    
    return Array.from(horseMap.values()).sort((a, b) => b.totalRides - a.totalRides)
  }
  
  const horseAnalytics = calculateHorseAnalytics()
  const selectedHorseData = horseAnalytics.find(h => h.horseName === selectedReportHorse)
  const totalRidesAllHorses = horseAnalytics.reduce((sum, h) => sum + h.totalRides, 0)

  const renderReports = () => (
    <div className="reports-section">
      {reportsLoading ? (
        <div className="reports-loading">
          <div className="spinner"></div>
          <p>Loading reports data...</p>
        </div>
      ) : (
        <>
          {/* Download Report Section */}
          <div className="reports-download">
            <div className="reports-download__row">
              <div className="reports-download__dropdown">
                <div 
                  className={`reports-download__trigger ${reportPeriodDropdownOpen ? 'reports-download__trigger--open' : ''}`}
                  onClick={() => setReportPeriodDropdownOpen(!reportPeriodDropdownOpen)}
                >
                  <span className="reports-download__value">
                    {reportPeriod === '1day' && 'Today'}
                    {reportPeriod === '1week' && '1 Week'}
                    {reportPeriod === '1month' && '1 Month'}
                    {reportPeriod === '2months' && '2 Months'}
                    {reportPeriod === '3months' && '3 Months'}
                  </span>
                  <span className="reports-download__arrow">▼</span>
                </div>
                {reportPeriodDropdownOpen && (
                  <>
                    <div 
                      className="reports-download__overlay" 
                      onClick={() => setReportPeriodDropdownOpen(false)}
                    />
                    <div className="reports-download__menu">
                      {[
                        { value: '1day', label: 'Today' },
                        { value: '1week', label: '1 Week' },
                        { value: '1month', label: '1 Month' },
                        { value: '2months', label: '2 Months' },
                        { value: '3months', label: '3 Months' }
                      ].map(option => (
                        <div
                          key={option.value}
                          className={`reports-download__item ${reportPeriod === option.value ? 'reports-download__item--selected' : ''}`}
                          onClick={() => {
                            setReportPeriod(option.value as typeof reportPeriod)
                            setReportPeriodDropdownOpen(false)
                          }}
                        >
                          <span className="reports-download__item-name">{option.label}</span>
                          {reportPeriod === option.value && <span className="reports-download__check">✓</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button 
                className="reports-download__btn"
                onClick={downloadRidesReport}
              >
                <DownloadIcon sx={{ fontSize: 16, marginRight: '6px' }} /> Download Report
              </button>
            </div>
          </div>

          {/* Horse Selection */}
          <div className="reports-filter">
            <label className="reports-filter__label">Select Horse:</label>
            <div className="reports-filter__row">
              <div className="reports-horse-dropdown">
                <div 
                  className={`reports-horse-dropdown__trigger ${reportsHorseDropdownOpen ? 'reports-horse-dropdown__trigger--open' : ''}`}
                  onClick={() => setReportsHorseDropdownOpen(!reportsHorseDropdownOpen)}
                >
                  <span className={`reports-horse-dropdown__value ${!selectedReportHorse ? 'reports-horse-dropdown__value--placeholder' : ''}`}>
                    {selectedReportHorse || '-- All Horses --'}
                  </span>
                  <span className="reports-horse-dropdown__arrow">▼</span>
                </div>
                {reportsHorseDropdownOpen && (
                  <>
                    <div 
                      className="reports-horse-dropdown__overlay" 
                      onClick={() => setReportsHorseDropdownOpen(false)}
                    />
                    <div className="reports-horse-dropdown__menu">
                      <div
                        className={`reports-horse-dropdown__item ${!selectedReportHorse ? 'reports-horse-dropdown__item--selected' : ''}`}
                        onClick={() => {
                          setSelectedReportHorse('')
                          setReportsHorseDropdownOpen(false)
                        }}
                      >
                        <span className="reports-horse-dropdown__item-name">All Horses</span>
                        {!selectedReportHorse && <span className="reports-horse-dropdown__check">✓</span>}
                      </div>
                      {horses.map(horse => (
                        <div
                          key={horse.id}
                          className={`reports-horse-dropdown__item ${selectedReportHorse === horse.name ? 'reports-horse-dropdown__item--selected' : ''}`}
                          onClick={() => {
                            setSelectedReportHorse(horse.name)
                            setReportsHorseDropdownOpen(false)
                          }}
                        >
                          <span className="reports-horse-dropdown__item-name">{horse.name}</span>
                          {selectedReportHorse === horse.name && <span className="reports-horse-dropdown__check">✓</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button 
                className="reports-filter__refresh"
                onClick={fetchRides}
                title="Refresh Data"
              >
                <RefreshIcon sx={{ fontSize: 16, marginRight: '4px' }} /> Refresh
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="reports-summary">
            <div className="reports-stat-card">
              <div className="reports-stat-card__icon"><HorseIcon size={28} /></div>
              <div className="reports-stat-card__content">
                <span className="reports-stat-card__value">
                  {selectedReportHorse ? selectedHorseData?.totalRides || 0 : totalRidesAllHorses}
                </span>
                <span className="reports-stat-card__label">Total Rides</span>
              </div>
            </div>
            <div className="reports-stat-card reports-stat-card--beginner">
              <div className="reports-stat-card__icon"><DirectionsWalkIcon sx={{ fontSize: 28, color: '#27ae60' }} /></div>
              <div className="reports-stat-card__content">
                <span className="reports-stat-card__value">
                  {selectedReportHorse 
                    ? selectedHorseData?.beginnerRides || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.beginnerRides, 0)}
                </span>
                <span className="reports-stat-card__label">Beginner Rides</span>
              </div>
            </div>
            <div className="reports-stat-card reports-stat-card--intermediate">
              <div className="reports-stat-card__icon"><TrendingUpIcon sx={{ fontSize: 28, color: '#f39c12' }} /></div>
              <div className="reports-stat-card__content">
                <span className="reports-stat-card__value">
                  {selectedReportHorse 
                    ? selectedHorseData?.intermediateRides || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.intermediateRides, 0)}
                </span>
                <span className="reports-stat-card__label">Intermediate Rides</span>
              </div>
            </div>
            <div className="reports-stat-card reports-stat-card--advanced">
              <div className="reports-stat-card__icon"><MilitaryTechIcon sx={{ fontSize: 28, color: '#e74c3c' }} /></div>
              <div className="reports-stat-card__content">
                <span className="reports-stat-card__value">
                  {selectedReportHorse 
                    ? selectedHorseData?.advancedRides || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.advancedRides, 0)}
                </span>
                <span className="reports-stat-card__label">Advanced Rides</span>
              </div>
            </div>
          </div>

          {/* Hours Breakdown */}
          <div className="reports-hours">
            <h3 className="reports-section-title"><AccessTimeIcon sx={{ fontSize: 20, marginRight: '8px', verticalAlign: 'middle' }} /> Hours Breakdown (45 mins per ride)</h3>
            <div className="reports-hours-grid">
              <div className="reports-hours-card">
                <span className="reports-hours-card__label">Total Hours</span>
                <span className="reports-hours-card__value">
                  {(selectedReportHorse 
                    ? selectedHorseData?.totalHours || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.totalHours, 0)
                  ).toFixed(1)} hrs
                </span>
              </div>
              <div className="reports-hours-card reports-hours-card--beginner">
                <span className="reports-hours-card__label">Beginner Hours</span>
                <span className="reports-hours-card__value">
                  {(selectedReportHorse 
                    ? selectedHorseData?.beginnerHours || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.beginnerHours, 0)
                  ).toFixed(1)} hrs
                </span>
              </div>
              <div className="reports-hours-card reports-hours-card--intermediate">
                <span className="reports-hours-card__label">Intermediate Hours</span>
                <span className="reports-hours-card__value">
                  {(selectedReportHorse 
                    ? selectedHorseData?.intermediateHours || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.intermediateHours, 0)
                  ).toFixed(1)} hrs
                </span>
              </div>
              <div className="reports-hours-card reports-hours-card--advanced">
                <span className="reports-hours-card__label">Advanced Hours</span>
                <span className="reports-hours-card__value">
                  {(selectedReportHorse 
                    ? selectedHorseData?.advancedHours || 0 
                    : horseAnalytics.reduce((sum, h) => sum + h.advancedHours, 0)
                  ).toFixed(1)} hrs
                </span>
              </div>
            </div>
          </div>

          {/* Horse Comparison Table */}
          <div className="reports-comparison">
            <h3 className="reports-section-title"><LeaderboardIcon sx={{ fontSize: 20, marginRight: '8px', verticalAlign: 'middle' }} /> Horse Comparison</h3>
            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Horse</th>
                    <th>Total Rides</th>
                    <th>Beginner</th>
                    <th>Intermediate</th>
                    <th>Advanced</th>
                    <th>Total Hours</th>
                    <th>Usage %</th>
                  </tr>
                </thead>
                <tbody>
                  {horseAnalytics.map((horse, index) => (
                    <tr 
                      key={horse.horseName} 
                      className={`${selectedReportHorse === horse.horseName ? 'reports-table__row--selected' : ''} ${index === 0 ? 'reports-table__row--top' : ''}`}
                      onClick={() => setSelectedReportHorse(horse.horseName === selectedReportHorse ? '' : horse.horseName)}
                    >
                      <td>
                        <div className="reports-table__horse">
                          {index === 0 && <span className="reports-table__crown"><WorkspacePremiumIcon sx={{ fontSize: 18, color: '#d4af37' }} /></span>}
                          {horse.horseName}
                        </div>
                      </td>
                      <td><strong>{horse.totalRides}</strong></td>
                      <td><span className="level-badge level-badge--beginner">{horse.beginnerRides}</span></td>
                      <td><span className="level-badge level-badge--intermediate">{horse.intermediateRides}</span></td>
                      <td><span className="level-badge level-badge--advanced">{horse.advancedRides}</span></td>
                      <td>{horse.totalHours.toFixed(1)} hrs</td>
                      <td>
                        <div className="reports-table__usage">
                          <div 
                            className="reports-table__usage-bar" 
                            style={{ width: `${totalRidesAllHorses > 0 ? (horse.totalRides / totalRidesAllHorses * 100) : 0}%` }}
                          />
                          <span>{totalRidesAllHorses > 0 ? (horse.totalRides / totalRidesAllHorses * 100).toFixed(1) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Horse Details */}
          {selectedReportHorse && selectedHorseData && (
            <div className="reports-details">
              <h3 className="reports-section-title">{selectedReportHorse} - Detailed Analytics</h3>
              <div className="reports-details-grid">
                <div className="reports-detail-card">
                  <h4>Ride Distribution</h4>
                  <div className="reports-distribution">
                    <div className="reports-distribution__bar">
                      <div 
                        className="reports-distribution__segment reports-distribution__segment--beginner"
                        style={{ width: `${selectedHorseData.totalRides > 0 ? (selectedHorseData.beginnerRides / selectedHorseData.totalRides * 100) : 0}%` }}
                        title={`Beginner: ${selectedHorseData.beginnerRides}`}
                      />
                      <div 
                        className="reports-distribution__segment reports-distribution__segment--intermediate"
                        style={{ width: `${selectedHorseData.totalRides > 0 ? (selectedHorseData.intermediateRides / selectedHorseData.totalRides * 100) : 0}%` }}
                        title={`Intermediate: ${selectedHorseData.intermediateRides}`}
                      />
                      <div 
                        className="reports-distribution__segment reports-distribution__segment--advanced"
                        style={{ width: `${selectedHorseData.totalRides > 0 ? (selectedHorseData.advancedRides / selectedHorseData.totalRides * 100) : 0}%` }}
                        title={`Advanced: ${selectedHorseData.advancedRides}`}
                      />
                    </div>
                    <div className="reports-distribution__legend">
                      <span className="reports-distribution__legend-item">
                        <span className="reports-distribution__dot reports-distribution__dot--beginner"></span>
                        Beginner ({selectedHorseData.totalRides > 0 ? (selectedHorseData.beginnerRides / selectedHorseData.totalRides * 100).toFixed(0) : 0}%)
                      </span>
                      <span className="reports-distribution__legend-item">
                        <span className="reports-distribution__dot reports-distribution__dot--intermediate"></span>
                        Intermediate ({selectedHorseData.totalRides > 0 ? (selectedHorseData.intermediateRides / selectedHorseData.totalRides * 100).toFixed(0) : 0}%)
                      </span>
                      <span className="reports-distribution__legend-item">
                        <span className="reports-distribution__dot reports-distribution__dot--advanced"></span>
                        Advanced ({selectedHorseData.totalRides > 0 ? (selectedHorseData.advancedRides / selectedHorseData.totalRides * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="reports-detail-card">
                  <h4>Comparison to Average</h4>
                  <div className="reports-comparison-stats">
                    {(() => {
                      const avgRides = totalRidesAllHorses / (horseAnalytics.length || 1)
                      const diff = selectedHorseData.totalRides - avgRides
                      const diffPercent = avgRides > 0 ? (diff / avgRides * 100) : 0
                      return (
                        <>
                          <div className="reports-comparison-stat">
                            <span className="reports-comparison-stat__label">Average rides per horse</span>
                            <span className="reports-comparison-stat__value">{avgRides.toFixed(1)}</span>
                          </div>
                          <div className="reports-comparison-stat">
                            <span className="reports-comparison-stat__label">{selectedReportHorse}'s rides</span>
                            <span className="reports-comparison-stat__value">{selectedHorseData.totalRides}</span>
                          </div>
                          <div className={`reports-comparison-stat ${diff >= 0 ? 'reports-comparison-stat--positive' : 'reports-comparison-stat--negative'}`}>
                            <span className="reports-comparison-stat__label">Difference from average</span>
                            <span className="reports-comparison-stat__value">
                              {diff >= 0 ? '+' : ''}{diff.toFixed(1)} ({diffPercent >= 0 ? '+' : ''}{diffPercent.toFixed(0)}%)
                            </span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {allRides.length === 0 && (
            <div className="reports-empty">
              <span className="reports-empty__icon"><InboxIcon sx={{ fontSize: 48, color: '#666' }} /></span>
              <p>No ride data available yet. Check-in riders to generate reports.</p>
            </div>
          )}
        </>
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
        return renderReports()
      case 'settings':
        return renderPlaceholder('Settings')
      default:
        return renderOverview()
    }
  }

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-loading__spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // If not authenticated, don't render (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`admin ${theme === 'light' ? 'theme-light' : ''}`}>
      {/* Sidebar */}
      <aside className="admin__sidebar">
        <div className="admin__logo">
          <img src="/logo.png" alt="Equine Enclave" className="admin__logo-img" />
          <span className="admin__logo-text">Equine Enclave</span>
        </div>
        
        <nav className="admin__nav">
          <button 
            className={`admin__nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="admin__nav-icon"><DashboardIcon sx={{ fontSize: 22 }} /></span>
            Overview
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'horses' ? 'active' : ''}`}
            onClick={() => setActiveTab('horses')}
          >
            <span className="admin__nav-icon"><HorseIcon size={22} /></span>
            Horses
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'riders' ? 'active' : ''}`}
            onClick={() => setActiveTab('riders')}
          >
            <span className="admin__nav-icon"><RiderIcon size={22} /></span>
            Riders
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="admin__nav-icon"><EventNoteIcon sx={{ fontSize: 22 }} /></span>
            Bookings
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <span className="admin__nav-icon"><PeopleIcon sx={{ fontSize: 22 }} /></span>
            Staff
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="admin__nav-icon"><BarChartIcon sx={{ fontSize: 22 }} /></span>
            Reports
          </button>
          <button 
            className={`admin__nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="admin__nav-icon"><SettingsIcon sx={{ fontSize: 22 }} /></span>
            Settings
          </button>
        </nav>

        <div className="admin__sidebar-footer">
          <div className="theme-toggle" onClick={toggleTheme}>
            <span className="theme-toggle__icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="theme-toggle__label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <div className="theme-toggle__switch"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin__main">
        {/* Header */}
        <header className="admin__header">
          <div className="admin__header-left">
            <img src="/logo.png" alt="Equine Enclave" className="admin__header-logo" />
            <div className="admin__header-titles">
              <h1 className="admin__title">{getPageTitle()}</h1>
              <p className="admin__subtitle">{getPageSubtitle()}</p>
            </div>
          </div>
          <div className="admin__header-right">
            <div className="admin__header-controls">
              {activeTab === 'riders' && (
                <div className="max-persons-dropdown">
                  <span className="max-persons-dropdown__label">Max per Batch:</span>
                  <div 
                    className={`max-persons-dropdown__trigger ${maxPersonsDropdownOpen ? 'max-persons-dropdown__trigger--open' : ''}`}
                    onClick={() => setMaxPersonsDropdownOpen(!maxPersonsDropdownOpen)}
                  >
                    <span className="max-persons-dropdown__value">{maxPersonsPerBatch}</span>
                    <span className="max-persons-dropdown__arrow">▼</span>
                  </div>
                  {maxPersonsDropdownOpen && (
                    <>
                      <div 
                        className="max-persons-dropdown__overlay" 
                        onClick={() => setMaxPersonsDropdownOpen(false)}
                      />
                      <div className="max-persons-dropdown__menu">
                        {[5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                          <div
                            key={num}
                            className={`max-persons-dropdown__item ${maxPersonsPerBatch === num ? 'max-persons-dropdown__item--selected' : ''}`}
                            onClick={() => {
                              handleMaxPersonsChange(num)
                              setMaxPersonsDropdownOpen(false)
                            }}
                          >
                            {num}
                            {maxPersonsPerBatch === num && <span className="max-persons-dropdown__check">✓</span>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <button className="admin__logout-btn" onClick={handleLogout} title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
            {activeTab === 'riders' && (
              <div className="admin__search">
                <input 
                  type="text" 
                  placeholder="Search riders... (Enter to filter)" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  onKeyDown={handleSearchKeyDown}
                />
                {showSearchResults && (
                  <div className="search-results">
                    <div className="search-results__header">
                      <span>Search Results ({searchResults.length})</span>
                      <button className="search-results__close" onClick={closeSearchResults}>✕</button>
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="search-results__list">
                        {searchResults.slice(0, 8).map((rider) => (
                          <div 
                            key={rider.id} 
                            className="search-result-item"
                            onClick={() => {
                              setActiveTab('riders')
                              setRiderFilter('all-details')
                              setSelectedRiderId(rider.id)
                              setShowSearchResults(false)
                              setSearchQuery('')
                            }}
                          >
                            <div className="search-result-item__avatar">
                              {rider.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="search-result-item__info">
                              <span className="search-result-item__name">{rider.name}</span>
                              <span className="search-result-item__meta">
                                {rider.batchLabel} - {rider.batchName} • {rider.phone}
                              </span>
                            </div>
                            <span className={`search-result-item__level level-badge level-badge--${rider.level}`}>
                              {rider.level}
                            </span>
                          </div>
                        ))}
                        {searchResults.length > 8 && (
                          <div className="search-results__more">
                            +{searchResults.length - 8} more results
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="search-results__empty">
                        No riders found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {renderContent()}
      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast--${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast__icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast__message">{toast.message}</span>
            <button className="toast__close" onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
