import { Box, Grid, Button, useTheme, useMediaQuery, Switch, FormControlLabel, List, ListItem, ListItemText, IconButton, Popover, Select, MenuItem } from '@mui/material'
import { LogOut, Download, Palette as PaletteIcon, Menu as MenuIcon, Settings, Bell, HelpCircle, X } from 'lucide-react'
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
    autoTable: (options: any) => any;
  }
}

// Make sure this is outside the Dashboard component
const widgets = [
  { id: 'activity', title: 'Activity History' },
  { id: 'patterns', title: 'Daily Activity Patterns' },
  { id: 'vehicles', title: 'Identified Vehicles' },
  { id: 'calendar', title: 'Calendar' },
  { id: 'colors', title: 'Popular T-shirt Colors' },
  { id: 'objects', title: 'Detected Objects' },
  { id: 'objectsByCamera', title: 'Objects by Camera' }
];

// Update the GRADIENT_PACKS constant
const GRADIENT_PACKS = [
  {
    name: 'Midnight',
    value: '#121212',
    gradient: 'linear-gradient(135deg, #121212 0%, #1a237e 100%)',
    background: 'linear-gradient(135deg, #121212 0%, #1a237e 100%)'
  },
  {
    name: 'Ocean',
    value: '#0A1929',
    gradient: 'linear-gradient(135deg, #0A1929 0%, #004d7a 100%)',
    background: 'linear-gradient(135deg, #0A1929 0%, #004d7a 100%)'
  },
  {
    name: 'Forest',
    value: '#1A2F1A',
    gradient: 'linear-gradient(135deg, #1A2F1A 0%, #2E7D32 100%)',
    background: 'linear-gradient(135deg, #1A2F1A 0%, #2E7D32 100%)'
  },
  {
    name: 'Sunset',
    value: '#1A1A2F',
    gradient: 'linear-gradient(135deg, #1A1A2F 0%, #FF6B6B 100%)',
    background: 'linear-gradient(135deg, #1A1A2F 0%, #FF6B6B 100%)'
  },
  {
    name: 'Aurora',
    value: '#1F1F1F',
    gradient: 'linear-gradient(135deg, #1F1F1F 0%, #00C9FF 100%)',
    background: 'linear-gradient(135deg, #1F1F1F 0%, #00C9FF 100%)'
  },
  {
    name: 'Volcanic',
    value: '#1A1A1A',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #FF4B2B 100%)',
    background: 'linear-gradient(135deg, #1A1A1A 0%, #FF4B2B 100%)'
  },
  {
    name: 'Raven',
    value: '#1E1E1E',
    gradient: 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)',
    background: 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
  }
];

// Add these type definitions at the top
type ChartType = 'bar' | 'line' | 'scatter' | 'bubble';
type ActivityType = 'car' | 'human' | 'bike' | 'truck' | 'bus';

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
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const savedVisibleWidgets = localStorage.getItem('visibleWidgets')
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

  const [colorAnchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedColor, setSelectedColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor')
    return savedColor || '#121212' // Default dark theme
  })

  const [textColor, setTextColor] = useState(() => {
    const savedTextColor = localStorage.getItem('textColor')
    return savedTextColor || '#ffffff' // Default white text
  })

  const themeColors = [
    { name: 'Dark', value: '#121212' },
    { name: 'Navy', value: '#0A1929' },
    { name: 'Forest', value: '#1A2F1A' },
    { name: 'Deep Purple', value: '#1A1A2F' },
    { name: 'Charcoal', value: '#1F1F1F' }
  ]

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setColorAnchorEl(null)
    // You can add logic here to update the theme globally
  }

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

  const getContrastTextColor = (bgColor: string) => {
    // For gradient backgrounds, use the first color (start color)
    const color = bgColor.includes('linear-gradient') 
      ? bgColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#FFFFFF'
      : bgColor;

    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    return luma < 180 ? '#FFFFFF' : '#000000';  // Adjusted threshold for better contrast
  };

  useEffect(() => {
    const newTextColor = getContrastTextColor(selectedColor);
    setTextColor(newTextColor);
    
    document.documentElement.style.setProperty('--main-bg-color', selectedColor);
    document.documentElement.style.setProperty('--scrollbar-track', selectedColor);
    document.documentElement.style.setProperty('--scrollbar-thumb', newTextColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)');
    document.documentElement.style.setProperty('--scrollbar-thumb-hover', newTextColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)');
    
    localStorage.setItem('selectedColor', selectedColor);
    localStorage.setItem('textColor', newTextColor);
  }, [selectedColor]);

  // Add this state in the Dashboard component
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add this state for settings drawer
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Update the menu items array
  const menuItems = [
    { 
      icon: <Settings size={20} />, 
      label: 'Settings',
      onClick: () => setSettingsDrawerOpen(true)
    },
    { 
      icon: <Bell size={20} />, 
      label: 'Notifications' 
    },
    { 
      icon: <HelpCircle size={20} />, 
      label: 'Help' 
    }
  ];

  // Add state for ActivityHistory settings
  const [activitySettingsOpen, setActivitySettingsOpen] = useState(false);

  // Update the state declarations
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Update the handleChartTypeChange function
  const handleChartTypeChange = (event: { target: { value: ChartType } }) => {
    setChartType(event.target.value);
  };

  // Add this type
  type ActivityType = 'car' | 'human' | 'bike' | 'truck' | 'bus'

  // Add barColors state
  const [barColors, setBarColors] = useState(() => {
    const savedColors = localStorage.getItem('activityBarColors')
    return savedColors ? JSON.parse(savedColors) : {
      car: 'rgba(136, 132, 216, 1)',
      human: 'rgba(130, 202, 157, 1)',
      bike: 'rgba(141, 209, 225, 1)',
      truck: 'rgba(255, 198, 88, 1)',
      bus: 'rgba(255, 128, 66, 1)'
    }
  })

  // Add colorPickerAnchor state
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{
    element: HTMLElement | null;
    type: ActivityType | null;
  }>({ element: null, type: null })

  // Add color sets constant
  const COLOR_SETS = [
    {
      name: 'Ocean Breeze',
      colors: {
        car: '#4facfe',
        human: '#00f2fe',
        bike: '#0099ff',
        truck: '#0062ff',
        bus: '#0033ff'
      }
    },
    {
      name: 'Forest Harmony',
      colors: {
        car: '#84fab0',
        human: '#68d391',
        bike: '#4fd1c5',
        truck: '#38b2ac',
        bus: '#319795'
      }
    },
    {
      name: 'Sunset Glow',
      colors: {
        car: '#ff6b6b',
        human: '#f06595',
        bike: '#e64980',
        truck: '#d6336c',
        bus: '#c2255c'
      }
    },
    {
      name: 'Purple Rain',
      colors: {
        car: '#a18cd1',
        human: '#9775fa',
        bike: '#845ef7',
        truck: '#7950f2',
        bus: '#6741d9'
      }
    },
    {
      name: 'Golden Dawn',
      colors: {
        car: '#ffd700',
        human: '#ffa500',
        bike: '#ff8c00',
        truck: '#ff7f50',
        bus: '#ff6347'
      }
    }
  ];

  // Add state for DailyPatterns settings
  const [dailyPatternsSettingsOpen, setDailyPatternsSettingsOpen] = useState(false);

  // Add state for DailyPatterns colors
  const [dailyPatternsColors, setDailyPatternsColors] = useState(() => {
    const savedColors = localStorage.getItem('dailyPatternsColors')
    return savedColors ? JSON.parse(savedColors) : {
      car: 'rgba(136, 132, 216, 1)',
      human: 'rgba(130, 202, 157, 1)',
      bike: 'rgba(141, 209, 225, 1)'
    }
  });

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
          background: selectedColor,
          minHeight: '100vh',
          p: { xs: 1, sm: 1.5, md: 2 },
          m: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'background 0.3s ease-in-out'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 1, sm: 1.5, md: 2 },
          color: textColor,
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
            <Box
              component="div"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                padding: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  transform: isMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              />
            </Box>
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

            {/* Color Selector Button */}
            <Button
              onClick={(e) => setColorAnchorEl(e.currentTarget)}
              startIcon={<PaletteIcon size={isMobile ? 16 : 18} />}
              sx={{
                color: textColor,
                textTransform: 'none',
                fontSize: { xs: FONT_SIZES.sm, sm: FONT_SIZES.md, md: FONT_SIZES.lg },
                '&:hover': {
                  bgcolor: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                }
              }}
            >
              Theme
            </Button>

            {/* Download Report Button */}
            <Button
              onClick={handleDownloadReport}
              startIcon={<Download size={isMobile ? 16 : 18} />}
              sx={{
                color: textColor,
                textTransform: 'none',
                fontSize: { xs: FONT_SIZES.sm, sm: FONT_SIZES.md, md: FONT_SIZES.lg },
                '&:hover': {
                  bgcolor: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                }
              }}
            >
              Download Report
            </Button>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              startIcon={<LogOut size={isMobile ? 16 : 18} />}
              sx={{
                color: textColor,
                textTransform: 'none',
                fontSize: { xs: FONT_SIZES.sm, sm: FONT_SIZES.md, md: FONT_SIZES.lg },
                '&:hover': {
                  bgcolor: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                }
              }}
            >
              Logout
            </Button>

            {/* Color Menu */}
            <Popover
              open={Boolean(colorAnchorEl)}
              anchorEl={colorAnchorEl}
              onClose={() => setColorAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: {
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 2,
                  maxWidth: '300px'
                }
              }}
            >
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
                p: 1
              }}>
                {GRADIENT_PACKS.map((pack) => (
                  <Box
                    key={pack.name}
                    onClick={() => {
                      setSelectedColor(pack.background);  // Use gradient background
                      localStorage.setItem('selectedColor', pack.background);
                      setColorAnchorEl(null);
                    }}
                    sx={{
                      width: '100px',
                      height: '60px',
                      borderRadius: '8px',
                      background: pack.gradient,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: selectedColor === pack.background ? 
                        '2px solid #82ca9d' : 
                        '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                      },
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      fontSize: '0.7rem',
                      textAlign: 'center'
                    }}>
                      {pack.name}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Popover>
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
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;

                // Calculate drop position relative to container
                const x = Math.floor((e.clientX - rect.left) / (containerWidth / 24));
                const y = Math.floor((e.clientY - rect.top) / 30);

                // Add widget to visible widgets if not already present
                if (!visibleWidgets.includes(widgetId)) {
                  const newVisibleWidgets = [...visibleWidgets, widgetId];
                  setVisibleWidgets(newVisibleWidgets);
                  localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
                }

                // Create new layout item
                const newLayoutItem = {
                  i: widgetId,
                  x: Math.min(Math.max(0, x), 24 - 12), // Ensure x is within bounds
                  y: Math.max(0, y),
                  w: 12,
                  h: 8,
                  minW: 6,
                  minH: 6
                };

                // Update layouts with new item
                const newLayout = [...layouts.lg.filter(item => item.i !== widgetId), newLayoutItem];
                setLayouts({ lg: newLayout });
                localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
              }
            }}
            sx={{ 
              width: '100%',
              minHeight: 'calc(100vh - 200px)',
              position: 'relative',
              bgcolor: selectedColor,
              overflowX: 'hidden',
              px: 2,
              transition: 'background-color 0.3s ease',
              border: dragState.isDragging ? '2px dashed rgba(130, 202, 157, 0.5)' : 'none',
              borderRadius: 2
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
              onLayoutChange={(newLayout) => {
                setLayouts({ lg: newLayout });
                localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
              }}
              draggableHandle=".drag-handle"
              resizeHandles={['se']}
              compactType={null}
              preventCollision={false}
              useCSSTransforms={true}
              transformScale={1}
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
                        bgcolor: textColor === '#ffffff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        p: 2, 
                        borderRadius: 2, 
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: textColor === '#ffffff' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: textColor === '#ffffff' ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.2)',
                        position: 'relative'
                      }}
                    >
                      <Box 
                        className="drag-handle"
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          right: 8,
                          height: '24px',
                          cursor: 'move',
                          zIndex: 10,
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                          '&:hover': {
                            opacity: 1
                          }
                        }} 
                      />
                      
                      {(() => {
                        switch (item.i) {
                          case 'activity':
                            return <ActivityHistory 
                              isDemoMode={isDemoMode} 
                              textColor={textColor} 
                              setActivitySettingsOpen={setActivitySettingsOpen}
                              chartType={chartType}
                              barColors={barColors}
                              onChartTypeChange={(type) => setChartType(type)}
                              onColorChange={(key, color) => {
                                const newColors = { ...barColors, [key]: color };
                                setBarColors(newColors);
                                localStorage.setItem('activityBarColors', JSON.stringify(newColors));
                              }}
                            />
                          case 'patterns':
                            return <DailyActivityPatterns 
                              isDemoMode={isDemoMode} 
                              textColor={textColor}
                              setDailyPatternsSettingsOpen={setDailyPatternsSettingsOpen}
                              chartType={chartType as ChartType}  // Add type assertion
                              areaColors={dailyPatternsColors}
                              onChartTypeChange={(type: ChartType) => setChartType(type)}
                              onColorChange={(key, color) => {
                                const newColors = { ...dailyPatternsColors, [key]: color };
                                setDailyPatternsColors(newColors);
                                localStorage.setItem('dailyPatternsColors', JSON.stringify(newColors));
                              }}
                            />
                          case 'vehicles':
                            return <IdentifiedVehicles isDemoMode={isDemoMode} textColor={textColor} />
                          case 'calendar':
                            return <Calendar textColor={textColor} />
                          case 'colors':
                            return <PopularColors isDemoMode={isDemoMode} textColor={textColor} />
                          case 'objects':
                            return <DetectedObjects isDemoMode={isDemoMode} textColor={textColor} />
                          case 'objectsByCamera':
                            return <DetectedObjectsByCamera isDemoMode={isDemoMode} textColor={textColor} />
                          default:
                            return null
                        }
                      })()}
                    </Box>
                  )
                })}
            </GridLayout>
          </Box>
        </motion.div>

        {/* Circular Menu Items */}
        <AnimatePresence>
          {isMenuOpen && menuItems.map((item, index) => {
            // Calculate position for horizontal layout
            const xOffset = (index + 1) * 60; // Space between icons
            
            return (
              <motion.div
                key={item.label}
                initial={{ scale: 0, x: 0 }}
                animate={{
                  scale: 1,
                  x: xOffset,  // Move right based on index
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: index * 0.05
                  }
                }}
                exit={{
                  scale: 0,
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: (menuItems.length - index) * 0.05
                  }
                }}
                style={{
                  position: 'absolute',
                  left: 90,  // Position after menu icon
                  top: 40,   // Increased from 20 to 40 to move icons lower
                  zIndex: 1199,
                  transformOrigin: 'center center'
                }}
              >
                <IconButton
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    }
                    setIsMenuOpen(false);
                  }}
                  sx={{
                    color: textColor,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                    width: 40,
                    height: 40,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {item.icon}
                </IconButton>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Settings Drawer */}
        <Box
          sx={{
            position: 'fixed',
            right: settingsDrawerOpen ? 20 : -300,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 250,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            transition: 'right 0.3s ease-in-out',
            zIndex: 1300,
          }}
        >
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            color: textColor,
            fontSize: '1rem',
            fontWeight: 500
          }}>
            Settings
            <IconButton
              onClick={() => setSettingsDrawerOpen(false)}
              sx={{
                padding: '4px',
                color: textColor,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          {/* Add draggable widget list */}
          <List sx={{ p: 0 }}>
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
                    cursor: 'grab'
                  },
                  '&:active': {
                    cursor: 'grabbing'
                  },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1
                }}
              >
                <ListItemText
                  primary={widget.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      color: visibleWidgets.includes(widget.id)
                        ? '#82ca9d'
                        : textColor
                    }
                  }}
                />
                <Switch
                  checked={visibleWidgets.includes(widget.id)}
                  onChange={() => {
                    if (visibleWidgets.includes(widget.id)) {
                      const newVisibleWidgets = visibleWidgets.filter(id => id !== widget.id);
                      setVisibleWidgets(newVisibleWidgets);
                      localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
                    } else {
                      const newVisibleWidgets = [...visibleWidgets, widget.id];
                      setVisibleWidgets(newVisibleWidgets);
                      localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#82ca9d',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#82ca9d',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Activity History Settings */}
        <Box
          sx={{
            position: 'fixed',
            right: activitySettingsOpen ? 20 : -300,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 250,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            transition: 'right 0.3s ease-in-out',
            zIndex: 1300,
          }}
        >
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            color: textColor,
            fontSize: '1rem',
            fontWeight: 500
          }}>
            Activity History Settings
            <IconButton
              onClick={() => setActivitySettingsOpen(false)}
              sx={{
                padding: '4px',
                color: textColor,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          {/* Chart Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ mb: 1, color: textColor, fontSize: '0.875rem' }}>Chart Type</Box>
            <Select
              value={chartType}
              onChange={handleChartTypeChange}
              size="small"
              fullWidth
              MenuProps={{  // Add this
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }
                }
              }}
              sx={{
                height: '36px',
                fontSize: '0.875rem',
                color: textColor,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',  // Darker background
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '& .MuiSelect-icon': {  // Add this
                  color: textColor
                }
              }}
            >
              {['bar', 'line', 'scatter', 'bubble'].map((type) => (
                <MenuItem 
                  key={type} 
                  value={type}
                  sx={{ 
                    fontSize: '0.875rem',
                    color: textColor,
                    bgcolor: 'rgba(0, 0, 0, 0.9)',  // Darker background
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)'
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Color Settings */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ mb: 1, color: textColor, fontSize: '0.875rem' }}>Color Themes</Box>
            {COLOR_SETS.map((set) => (
              <Box
                key={set.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor: barColors === set.colors ? 
                    'rgba(255, 255, 255, 0.1)' : 
                    'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
                onClick={() => {
                  setBarColors(set.colors);
                  localStorage.setItem('activityBarColors', JSON.stringify(set.colors));
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5 
                }}>
                  {Object.values(set.colors).map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: color,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ 
                  color: textColor,
                  fontSize: '0.875rem',
                  flex: 1
                }}>
                  {set.name}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* DailyPatterns Settings */}
        <Box
          sx={{
            position: 'fixed',
            right: dailyPatternsSettingsOpen ? 20 : -300,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 250,
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            transition: 'right 0.3s ease-in-out',
            zIndex: 1300,
          }}
        >
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            color: textColor,
            fontSize: '1rem',
            fontWeight: 500
          }}>
            DailyPatterns Settings
            <IconButton
              onClick={() => setDailyPatternsSettingsOpen(false)}
              sx={{
                padding: '4px',
                color: textColor,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          {/* Chart Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ mb: 1, color: textColor, fontSize: '0.875rem' }}>Chart Type</Box>
            <Select
              value={chartType}
              onChange={handleChartTypeChange}
              size="small"
              fullWidth
              MenuProps={{  // Add this
                PaperProps: {
                  sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }
                }
              }}
              sx={{
                height: '36px',
                fontSize: '0.875rem',
                color: textColor,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',  // Darker background
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '& .MuiSelect-icon': {  // Add this
                  color: textColor
                }
              }}
            >
              {['bar', 'line', 'scatter', 'bubble'].map((type) => (
                <MenuItem 
                  key={type} 
                  value={type}
                  sx={{ 
                    fontSize: '0.875rem',
                    color: textColor,
                    bgcolor: 'rgba(0, 0, 0, 0.9)',  // Darker background
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)'
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Color Settings */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ mb: 1, color: textColor, fontSize: '0.875rem' }}>Color Themes</Box>
            {COLOR_SETS.map((set) => (
              <Box
                key={set.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor: dailyPatternsColors === set.colors ? 
                    'rgba(255, 255, 255, 0.1)' : 
                    'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
                onClick={() => {
                  setDailyPatternsColors(set.colors);
                  localStorage.setItem('dailyPatternsColors', JSON.stringify(set.colors));
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5 
                }}>
                  {Object.values(set.colors).map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: color,
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ 
                  color: textColor,
                  fontSize: '0.875rem',
                  flex: 1
                }}>
                  {set.name}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
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
