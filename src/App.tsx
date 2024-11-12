import { Box, Grid, Button, useTheme, useMediaQuery, Switch, FormControlLabel, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Login from './pages/auth/Login'
import ActivityHistory from './components/ActivityHistory'
import DetectedObjects from './components/DetectedObjects'
import IdentifiedVehicles from './components/IdentifiedVehicles'
import DailyActivityPatterns from './components/DailyActivityPatterns'
import DetectedObjectsByCamera from './components/DetectedObjectsByCamera'
import PopularColors from './components/PopularColors'
import Calendar from './components/Calendar'
import SpinnerLoader from './components/SpinnerLoader'
import { useState, useEffect, useRef } from 'react'
import logo from './assets/logo.webp'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { LogOut, ChevronRight, ChevronLeft, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Add font size constants
const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem' // 30px
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Add this type definition before the Dashboard component
type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
}

// Add this interface at the top of the file
interface AutoTableOutput {
  finalY: number;
}

// Add this interface for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body: string[][];
      theme?: string;
      headStyles?: {
        fillColor: number[];
      };
      styles?: {
        fontSize: number;
      };
      margin?: {
        left: number;
        right: number;
      };
    }) => void;
    lastAutoTable: AutoTableOutput;
    internal: {
      pageSize: {
        width: number;
        height: number;
      };
      getNumberOfPages: () => number;
    };
  }
}

// Move widgets array before the Dashboard component
const widgets = [
  { id: 'activity', title: 'Activity History' },
  { id: 'patterns', title: 'Daily Activity Patterns' },
  { id: 'vehicles', title: 'Identified Vehicles' },
  { id: 'calendar', title: 'Calendar' },
  { id: 'colors', title: 'Popular T-shirt Colors' },
  { id: 'objects', title: 'Detected Objects' },
  { id: 'objectsByCamera', title: 'Objects by Camera' }
];

const Dashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [username, setUsername] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const savedDemoMode = localStorage.getItem('isDemoMode')
    return savedDemoMode ? JSON.parse(savedDemoMode) : true // Default to true if not set
  })
  const [showUsername, setShowUsername] = useState(false)
  const usernameDropdownRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.98)
  const containerRef = useRef<HTMLDivElement>(null)
  const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>(() => {
    const savedLayout = localStorage.getItem('dashboardLayout')
    const defaultLayout = [
      { i: 'activity', x: 0, y: 0, w: 12, h: 8, minW: 6, minH: 6, static: false },
      { i: 'patterns', x: 12, y: 0, w: 12, h: 8, minW: 6, minH: 6, static: false },
      { i: 'vehicles', x: 0, y: 8, w: 12, h: 8, minW: 6, minH: 6, static: false },
      { i: 'calendar', x: 12, y: 8, w: 12, h: 4, minW: 6, minH: 4, static: false },
      { i: 'colors', x: 12, y: 12, w: 12, h: 8, minW: 6, minH: 6, static: false },
      { i: 'objects', x: 0, y: 16, w: 12, h: 8, minW: 6, minH: 6, static: false },
      { i: 'objectsByCamera', x: 12, y: 16, w: 12, h: 8, minW: 6, minH: 6, static: false }
    ]
    return {
      lg: savedLayout ? JSON.parse(savedLayout) : defaultLayout
    }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add this state to track visible widgets
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const savedVisibleWidgets = localStorage.getItem('visibleWidgets')
    // If no saved state, show all widgets by default
    return savedVisibleWidgets ? JSON.parse(savedVisibleWidgets) : widgets.map(w => w.id)
  })

  // Add this type for dragging state
  type DragState = {
    isDragging: boolean;
    draggedWidget: string | null;
  }

  // In the Dashboard component, add this state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedWidget: null
  });

  useEffect(() => {
    // Get user info from localStorage
    const storedUsername = localStorage.getItem('username')
    const storedRole = localStorage.getItem('userRole')
    if (storedUsername) {
      setUsername(storedUsername)
    }
    if (storedRole) {
      setUserRole(storedRole)
    }
  }, [])

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      try {
      
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate 2s loading
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const getWelcomeMessage = () => {
    const time = new Date().getHours()
    let greeting = ''
    
    if (time < 12) greeting = 'Good morning'
    else if (time < 17) greeting = 'Good afternoon'
    else greeting = 'Good evening'

    switch (userRole?.toLowerCase()) {
      case 'admin':
        return `${greeting}, Administrator`
      case 'security':
        return `${greeting}, Officer`
      case 'manager':
        return `${greeting}, Manager`
      default:
        return `${greeting}, ${username}`
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usernameDropdownRef.current && !usernameDropdownRef.current.contains(event.target as Node)) {
        setShowUsername(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth * 0.98)
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Add this function to handle adding widgets to dashboard
  const handleAddWidget = (widgetId: string) => {
    if (!visibleWidgets.includes(widgetId)) {
      const newVisibleWidgets = [...visibleWidgets, widgetId]
      setVisibleWidgets(newVisibleWidgets)
      localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets))
    }
  }

  // Add this function to handle removing widgets from dashboard
  const handleRemoveWidget = (widgetId: string) => {
    const newVisibleWidgets = visibleWidgets.filter(id => id !== widgetId)
    setVisibleWidgets(newVisibleWidgets)
    localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets))
  }

  const handleDownloadReport = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const title = 'Dashboard Report'
      const date = new Date().toLocaleString()
      const pageWidth = pdf.internal.pageSize.width

      // Set up PDF styling
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(20)
      pdf.text(title, pageWidth / 2, 15, { align: 'center' })
      pdf.setFontSize(12)
      pdf.text(`Generated on: ${date}`, pageWidth / 2, 25, { align: 'center' })

      let yPosition = 40

      // Add Stats Section
      pdf.setFontSize(16)
      pdf.text('Current Statistics', 14, yPosition)
      yPosition += 10

      const stats = [
        { label: 'Scene Analysis Cameras', value: isDemoMode ? '2' : '0' },
        { label: 'Total Count', value: isDemoMode ? '4.9k' : '0' },
        { label: 'People Count (Last 5 min)', value: isDemoMode ? '2' : '0' },
        { label: 'Vehicle Count (Last 5 min)', value: isDemoMode ? '1' : '0' },
        { label: 'People Count (Peak Hour)', value: isDemoMode ? '259' : '0' },
        { label: 'Vehicle Count (Peak Hour)', value: isDemoMode ? '473' : '0' }
      ]

      // Add stats table
      pdf.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: stats.map(stat => [stat.label, stat.value]),
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      })

      yPosition = (pdf.lastAutoTable as AutoTableOutput).finalY + 15

      // Add Activity Section
      pdf.setFontSize(16)
      pdf.text('Activity Summary', 14, yPosition)
      yPosition += 10

      if (isDemoMode) {
        const activityData = [
          { type: 'Cars', count: '45%', trend: 'Increasing' },
          { type: 'People', count: '30%', trend: 'Stable' },
          { type: 'Bikes', count: '15%', trend: 'Decreasing' },
          { type: 'Trucks', count: '7%', trend: 'Stable' },
          { type: 'Buses', count: '3%', trend: 'Increasing' }
        ]

        pdf.autoTable({
          startY: yPosition,
          head: [['Type', 'Percentage', 'Trend']],
          body: activityData.map(item => [item.type, item.count, item.trend]),
          theme: 'grid',
          headStyles: { fillColor: [33, 150, 243] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 }
        })

        yPosition = (pdf.lastAutoTable as AutoTableOutput).finalY + 15
      }

      // Add Daily Patterns Section
      pdf.setFontSize(16)
      pdf.text('Daily Patterns Overview', 14, yPosition)
      yPosition += 10

      if (isDemoMode) {
        const patternData = [
          { time: 'Morning (6-10)', activity: 'High', dominant: 'Vehicles' },
          { time: 'Midday (10-14)', activity: 'Medium', dominant: 'People' },
          { time: 'Afternoon (14-18)', activity: 'High', dominant: 'Mixed' },
          { time: 'Evening (18-22)', activity: 'Medium', dominant: 'Vehicles' },
          { time: 'Night (22-6)', activity: 'Low', dominant: 'Vehicles' }
        ]

        pdf.autoTable({
          startY: yPosition,
          head: [['Time Period', 'Activity Level', 'Dominant Type']],
          body: patternData.map(item => [item.time, item.activity, item.dominant]),
          theme: 'grid',
          headStyles: { fillColor: [33, 150, 243] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 }
        })
      }

      // Add footer
      const pageCount = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }

      // Save the PDF
      pdf.save(`dashboard-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999
        }}
      >
        <SpinnerLoader />
      </Box>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <Box 
        id="dashboard-content"
        sx={{ 
          bgcolor: '#121212',
          minHeight: '100vh',
          p: { xs: 1, sm: 1.5, md: 2 },
          m: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 1, sm: 1.5, md: 2 },
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: { xs: FONT_SIZES.md, sm: FONT_SIZES.lg },
          flexWrap: 'wrap',
          gap: 1
        }}>
          {/* Logo and Welcome Message Container */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            {/* Logo */}
            <motion.div
              ref={usernameDropdownRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUsername(!showUsername)}
              style={{ 
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <img 
                src={logo} 
                alt="Logo" 
                style={{
                  height: isMobile ? '40px' : '50px',
                  width: isMobile ? '40px' : '50px',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
              />
              {showUsername && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px',
                    backgroundColor: '#2A2A2A',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    border: '2px solid #404040'
                  }}
                >
                  <Box sx={{ 
                    fontSize: FONT_SIZES.sm,
                    color: '#ffffff',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {username}
                  </Box>
                  <Box sx={{ 
                    fontSize: FONT_SIZES.xs,
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center',
                    mt: 0.5
                  }}>
                    {userRole}
                  </Box>
                </motion.div>
              )}
            </motion.div>

            {/* Welcome Message - Only show when username dropdown is not visible */}
            {!showUsername && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <Box sx={{ 
                    fontSize: FONT_SIZES.sm,
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {userRole && (
                      <Box component="span" sx={{ 
                        display: 'inline-block',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: FONT_SIZES.xs,
                        mr: 1
                      }}>
                        {userRole.toUpperCase()}
                      </Box>
                    )}
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Box>
                  <Box sx={{ 
                    fontSize: FONT_SIZES.lg,
                    fontWeight: 500,
                    mt: 0.5
                  }}>
                    {getWelcomeMessage()}
                  </Box>
                </Box>
              </motion.div>
            )}
          </Box>

          {/* Right section with Demo Mode toggle and Logout */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDemoMode}
                  onChange={(e) => {
                    setIsDemoMode(e.target.checked)
                    localStorage.setItem('isDemoMode', JSON.stringify(e.target.checked))
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#82ca9d',
                      '&:hover': {
                        backgroundColor: 'rgba(130, 202, 157, 0.08)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#82ca9d',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: isDemoMode ? '#82ca9d' : '#fff',
                    }
                  }}
                />
              }
              label={
                <Box sx={{ 
                  fontSize: FONT_SIZES.sm,
                  color: isDemoMode ? '#82ca9d' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: isDemoMode ? 600 : 400,
                  transition: 'color 0.3s ease'
                }}>
                  Demo Mode
                </Box>
              }
              sx={{
                marginRight: 0,
                '& .MuiFormControlLabel-label': {
                  marginLeft: 1
                }
              }}
            />

            {/* Add Download Button */}
            <Button
              onClick={handleDownloadReport}
              startIcon={<Download size={isMobile ? 16 : 18} />}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'none',
                fontSize: { xs: FONT_SIZES.sm, sm: FONT_SIZES.md, md: FONT_SIZES.lg },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Download Report
            </Button>

            <Button
              onClick={handleLogout}
              startIcon={<LogOut size={isMobile ? 16 : 18} />}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'none',
                fontSize: { xs: FONT_SIZES.sm, sm: FONT_SIZES.md, md: FONT_SIZES.lg },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Grid 
            container 
            spacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{ 
              mb: { xs: 1.5, sm: 2, md: 3 },
              m: 0,
              width: 'auto'
            }}
          >
            {/* Scene analysis cameras */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Scene analysis cameras
                </Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDemoMode ? '2' : '0'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {isDemoMode ? (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }}
                        >
                          2
                        </motion.span>
                      ) : '0'}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Grid>

            {/* Total count */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Total count
                </Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDemoMode ? '4.9k' : '0'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {isDemoMode ? (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }}
                        >
                          4.9k
                        </motion.span>
                      ) : '0'}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Grid>

            {/* People count (last 5 minutes) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  People count (last 5 minutes)
                </Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDemoMode ? '2' : '0'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {isDemoMode ? (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }}
                        >
                          2
                        </motion.span>
                      ) : '0'}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Grid>

            {/* Vehicle count (last 5 minutes) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Vehicle count (last 5 minutes)
                </Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDemoMode ? '0' : '0'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {isDemoMode ? (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }}
                        >
                          0
                        </motion.span>
                      ) : '0'}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Grid>

            {/* People count (peak hour) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  People count (peak hour)
                </Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDemoMode ? '259' : '0'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {isDemoMode ? (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }}
                        >
                          259
                        </motion.span>
                      ) : '0'}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Grid>

            {/* Vehicle count (peak hour) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Vehicle count (peak hour)
                </Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDemoMode ? '473' : '0'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <Box sx={{ 
                      fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {isDemoMode ? (
                        <motion.span
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 400,
                            damping: 10
                          }}
                        >
                          473
                        </motion.span>
                      ) : '0'}
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Box 
            ref={containerRef} 
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const widgetId = e.dataTransfer.getData('text/plain');
              if (widgetId) {
                // Calculate drop position
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.floor((e.clientX - rect.left) / (containerWidth / 24));
                const y = Math.floor((e.clientY - rect.top) / 30);

                // Add widget to visible widgets
                const newVisibleWidgets = [...visibleWidgets, widgetId];
                setVisibleWidgets(newVisibleWidgets);
                localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));

                // Create new layout item
                const newLayoutItem = {
                  i: widgetId,
                  x: Math.min(Math.max(0, x), 24 - 12),
                  y: Math.max(0, y),
                  w: 12,
                  h: 8,
                  minW: 6,
                  minH: 6
                };

                // Update layouts with new item
                const newLayout = [...layouts.lg, newLayoutItem];
                setLayouts({ lg: newLayout });
                localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
              }
              setDragState({
                isDragging: false,
                draggedWidget: null
              });
            }}
            sx={{ 
              width: '100%', 
              height: '100%',
              minHeight: '100vh',
              bgcolor: dragState.isDragging ? 'rgba(130, 202, 157, 0.05)' : '#121212',
              overflowX: 'hidden',
              px: 2,
              transition: 'all 0.3s ease',
              border: dragState.isDragging ? '2px dashed #82ca9d' : 'none',
              '& .react-grid-item': {
                transition: 'all 200ms ease',
                visibility: 'visible !important',
                opacity: 1,
                '&.react-draggable-dragging': {
                  transition: 'none',
                  zIndex: 100,
                  opacity: 0.9,
                  cursor: 'grabbing',
                  transform: 'scale(1.02)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }
              },
              '& .react-grid-item.react-grid-placeholder': {
                background: 'rgba(130, 202, 157, 0.2)',
                border: '2px dashed #82ca9d',
                opacity: 0.5,
                borderRadius: '4px',
                visibility: 'visible !important'
              }
            }}
          >
            <GridLayout
              className="layout"
              layout={layouts.lg}
              cols={24}
              rowHeight={30}
              width={containerWidth}
              margin={[15, 15]}
              containerPadding={[10, 10]}
              isDraggable={true}
              isResizable={true}
              resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
              onLayoutChange={(newLayout) => {
                setLayouts({ lg: newLayout })
                localStorage.setItem('dashboardLayout', JSON.stringify(newLayout))
              }}
              onDragStart={(layout, oldItem, newItem, placeholder, e, element) => {
                element.style.transition = 'none'
              }}
              onDragStop={(layout, oldItem, newItem, placeholder, e, element) => {
                element.style.transition = 'all 200ms ease'
              }}
              onResizeStart={(layout, oldItem, newItem, placeholder, e, element) => {
                element.style.transition = 'none'
              }}
              onResizeStop={(layout, oldItem, newItem, placeholder, e, element) => {
                element.style.transition = 'all 200ms ease'
              }}
              draggableHandle=".drag-handle"
              style={{ 
                minHeight: '100vh',
                backgroundColor: '#121212',
                paddingBottom: '50px',
                width: '100%',
                overflowX: 'hidden'
              }}
            >
              {layouts.lg
                .filter((item: LayoutItem) => visibleWidgets.includes(item.i))
                .map((item: LayoutItem) => {
                  const widget = widgets.find(w => w.id === item.i);
                  if (!widget) return null;

                  return (
                    <Box 
                      key={item.i} 
                      data-grid={item}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        p: 2, 
                        borderRadius: 2, 
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'auto',
                        '& .react-resizable-handle': {
                          opacity: 0,
                          width: '20px',
                          height: '20px',
                          position: 'absolute',
                          '&::after': {
                            display: 'none'
                          },
                          '&:hover': {
                            opacity: 0
                          }
                        },
                        '&:hover .react-resizable-handle': {
                          opacity: 0
                        },
                        '&:hover': {
                          outline: '2px solid rgba(130, 202, 157, 0.5)',
                          outlineOffset: '-2px'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          mb: 0.5, 
                          fontSize: '0.9rem',
                          cursor: 'move'
                        }} 
                        className="drag-handle"
                      >
                        {widget.title}
                      </Box>
                      <Box 
                        sx={{ 
                          flex: 1, 
                          minHeight: 0,
                          position: 'relative',
                          '& > *': { 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                          }
                        }}
                      >
                        {(() => {
                          switch (item.i) {
                            case 'activity':
                              return <ActivityHistory isDemoMode={isDemoMode} />
                            case 'patterns':
                              return <DailyActivityPatterns isDemoMode={isDemoMode} />
                            case 'vehicles':
                              return <IdentifiedVehicles isDemoMode={isDemoMode} />
                            case 'calendar':
                              return <Calendar />
                            case 'colors':
                              return <PopularColors isDemoMode={isDemoMode} />
                            case 'objects':
                              return <DetectedObjects isDemoMode={isDemoMode} />
                            case 'objectsByCamera':
                              return <DetectedObjectsByCamera isDemoMode={isDemoMode} />
                            default:
                              return null
                          }
                        })()}
                      </Box>
                    </Box>
                  )
                })}
            </GridLayout>
          </Box>
        </motion.div>

        <IconButton
          onClick={() => setSidebarOpen(true)}
          sx={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            zIndex: 1200
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant="persistent"
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              backgroundColor: '#1E1E1E',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 2,
              color: 'rgba(255, 255, 255, 0.87)'
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Box sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 500 
            }}>
              Dashboard Widgets
            </Box>
            <IconButton 
              onClick={() => setSidebarOpen(false)}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          <List sx={{ width: '100%' }}>
            {widgets.map((widget) => (
              <ListItem
                key={widget.id}
                draggable
                onDragStart={(e) => {
                  setDragState({
                    isDragging: true,
                    draggedWidget: widget.id
                  });
                  e.dataTransfer.setData('text/plain', widget.id);
                  e.currentTarget.style.opacity = '0.5';
                }}
                onDragEnd={(e) => {
                  setDragState({
                    isDragging: false,
                    draggedWidget: null
                  });
                  e.currentTarget.style.opacity = '1';
                }}
                onClick={() => {
                  if (visibleWidgets.includes(widget.id)) {
                    handleRemoveWidget(widget.id);
                  } else {
                    handleAddWidget(widget.id);
                  }
                }}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: visibleWidgets.includes(widget.id) 
                    ? 'rgba(130, 202, 157, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    backgroundColor: visibleWidgets.includes(widget.id)
                      ? 'rgba(130, 202, 157, 0.2)'
                      : 'rgba(255, 255, 255, 0.08)',
                  },
                  transition: 'all 0.2s ease',
                  cursor: 'grab',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:active': {
                    cursor: 'grabbing'
                  }
                }}
              >
                <ListItemText
                  primary={widget.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      color: visibleWidgets.includes(widget.id)
                        ? '#82ca9d'
                        : 'rgba(255, 255, 255, 0.87)'
                    }
                  }}
                />
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: visibleWidgets.includes(widget.id)
                      ? '#82ca9d'
                      : 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 1
                  }}
                >
                  {visibleWidgets.includes(widget.id) && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#82ca9d'
                      }}
                    />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>
    </motion.div>
  )
}

function App() {
  return (
    <Router>
      <Box sx={{ 
        width: '100vw', 
        height: '100vh',
        bgcolor: '#121212',
        color: '#ffffff',
        '& #root': {
          maxWidth: 'none',
          padding: 0,
          margin: 0
        }
      }}>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Box>
    </Router>
  )
}

export default App
