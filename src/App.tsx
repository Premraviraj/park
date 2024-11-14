import { Box, Grid, Button, useTheme, useMediaQuery, Switch, FormControlLabel, List, ListItem, ListItemText, IconButton, Popover, Select, MenuItem, Typography } from '@mui/material'
import { LogOut, Download, Palette as PaletteIcon, Menu as MenuIcon, Settings, Lock, HelpCircle, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
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
import LocalConfig from './pages/LocalConfig'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SelectChangeEvent } from '@mui/material/Select';

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

// Update jsPDF type definition
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: string[][];
      theme?: string;
      headStyles?: Record<string, any>;
      styles?: Record<string, any>;
      margin?: Record<string, number>;
    }) => { finalY: number };
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
type ChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'area';
type ActivityType = 'car' | 'human' | 'bike' | 'truck' | 'bus';

// Add preset color schemes for different components
const PRESET_SCHEMES = {
  activityHistory: [
    {
      name: 'Ocean',
      colors: {
        car: '#4facfe',
        human: '#00f2fe',
        bike: '#0099ff',
        truck: '#0062ff',
        bus: '#0033ff'
      }
    },
    {
      name: 'Forest',
      colors: {
        car: '#84fab0',
        human: '#68d391',
        bike: '#4fd1c5',
        truck: '#38b2ac',
        bus: '#319795'
      }
    },
    {
      name: 'Sunset',
      colors: {
        car: '#ff6b6b',
        human: '#f06595',
        bike: '#e64980',
        truck: '#d6336c',
        bus: '#c2255c'
      }
    }
  ],
  dailyPatterns: [
    {
      name: 'Classic',
      colors: {
        morning: '#ffd700',
        afternoon: '#ff7f50',
        evening: '#4b0082'
      }
    },
    {
      name: 'Modern',
      colors: {
        morning: '#00bfff',
        afternoon: '#32cd32',
        evening: '#9370db'
      }
    },
    {
      name: 'Pastel',
      colors: {
        morning: '#ffb6c1',
        afternoon: '#98fb98',
        evening: '#dda0dd'
      }
    }
  ],
  detectedObjects: [
    {
      name: 'Vibrant',
      colors: {
        person: '#ff4757',
        vehicle: '#2ed573',
        animal: '#ffa502',
        object: '#1e90ff'
      }
    },
    {
      name: 'Cool',
      colors: {
        person: '#70a1ff',
        vehicle: '#7bed9f',
        animal: '#a4b0be',
        object: '#5352ed'
      }
    },
    {
      name: 'Warm',
      colors: {
        person: '#ff6b81',
        vehicle: '#ffa502',
        animal: '#ff7f50',
        object: '#ff6348'
      }
    }
  ],
  identifiedVehicles: [
    {
      name: 'Classic',
      colors: {
        in: '#4facfe',
        out: '#ff6b6b'
      }
    },
    {
      name: 'Vintage',
      colors: {
        in: '#84fab0',
        out: '#f06595'
      }
    },
    {
      name: 'Modern',
      colors: {
        in: '#00f2fe',
        out: '#e64980'
      }
    }
  ]
};

// First, add this type for the dropdown options
type ActivityHistoryView = 'default' | 'compact' | 'detailed' | 'hidden';

// Add this component for graph preview
const GraphPreview: React.FC<{ type: ChartType; colors: Record<string, string>; textColor: string }> = ({ 
  type, 
  colors, 
  textColor 
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '120px',
        border: `1px solid ${textColor}`,
        borderRadius: 1,
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {type === 'bar' && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 1, pt: 2, pb: 1 }}>
          {Object.entries(colors).map(([key, color], i) => (
            <Box
              key={key}
              sx={{
                width: '14px',
                height: `${30 + Math.random() * 50}%`,
                backgroundColor: color,
                borderRadius: '2px 2px 0 0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}
      {type === 'line' && (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={`M 0,${50 + Math.random() * 20} ${Object.values(colors).map((_, i) => 
                `L ${(i + 1) * (100 / Object.keys(colors).length)},${50 + Math.random() * 20}`
              ).join(' ')}`}
              stroke={Object.values(colors)[0]}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </Box>
      )}
      {type === 'scatter' && (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {Object.entries(colors).map(([key, color]) => (
            Array(5).fill(0).map((_, i) => (
              <Box
                key={`${key}-${i}`}
                sx={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  backgroundColor: color,
                  borderRadius: '50%',
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                  transition: 'all 0.3s ease'
                }}
              />
            ))
          ))}
        </Box>
      )}
      {type === 'bubble' && (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          {Object.entries(colors).map(([key, color]) => (
            Array(3).fill(0).map((_, i) => (
              <Box
                key={`${key}-${i}`}
                sx={{
                  position: 'absolute',
                  width: `${10 + Math.random() * 20}px`,
                  height: `${10 + Math.random() * 20}px`,
                  backgroundColor: `${color}80`,
                  borderRadius: '50%',
                  left: `${Math.random() * 80}%`,
                  top: `${Math.random() * 80}%`,
                  transition: 'all 0.3s ease'
                }}
              />
            ))
          ))}
        </Box>
      )}
    </Box>
  );
};

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

  // Add these near other state declarations
  const usernameDropdownRef = useRef<HTMLDivElement>(null);
  const [showUsername, setShowUsername] = useState(false);

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

  // Add state for layout locking
  const [isLayoutLocked, setIsLayoutLocked] = useState(() => {
    const savedLockState = localStorage.getItem('isLayoutLocked');
    return savedLockState ? JSON.parse(savedLockState) : false;
  });

  // Update the menu items array to include lock functionality
  const menuItems = [
    { 
      icon: <Settings size={20} />, 
      label: 'Settings',
      onClick: () => setSettingsDrawerOpen(true)
    },
    { 
      icon: <PaletteIcon size={20} />, 
      label: 'Theme',
      onClick: (e: React.MouseEvent<HTMLElement>) => setColorAnchorEl(e.currentTarget)
    },
    { 
      icon: <Download size={20} />, 
      label: 'Download Report',
      onClick: handleDownloadReport
    },
    { 
      icon: <Lock size={20} />,
      label: isLayoutLocked ? 'Unlock Layout' : 'Lock Layout',
      onClick: () => {
        setIsLayoutLocked(!isLayoutLocked);
        localStorage.setItem('isLayoutLocked', JSON.stringify(!isLayoutLocked));
      }
    },
    { 
      icon: <HelpCircle size={20} />, 
      label: 'Help' 
    },
    { 
      icon: <LogOut size={20} />, 
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  // Add state for ActivityHistory settings
  const [activitySettingsOpen, setActivitySettingsOpen] = useState(false);

  // Update the state declarations
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Update the handleChartTypeChange function
  const handleChartTypeChange = (componentId: string) => (event: SelectChangeEvent<ChartType>) => {
    const newType = event.target.value as ChartType;
    if (componentId === 'vehicles') {
      setVehiclesChartType(newType);
      localStorage.setItem('vehiclesChartType', newType);
    } else if (componentId === 'patterns') {
      setPatternsChartType(newType);
      localStorage.setItem('patternsChartType', newType);
    } else if (componentId === 'activity') {
      setActivityChartType(newType);
      localStorage.setItem('activityChartType', newType);
    }
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
      morning: '#ffd700',
      afternoon: '#ff7f50',
      evening: '#4b0082'
    }
  });

  // Add this state in the Dashboard component
  const [activityHistoryView, setActivityHistoryView] = useState<ActivityHistoryView>('default');

  // Add separate states for each component's chart type and colors
  const [activityChartType, setActivityChartType] = useState<ChartType>('bar');
  const [patternsChartType, setPatternsChartType] = useState<ChartType>('bar');

  // Add these states in Dashboard component
  const [vehiclesChartType, setVehiclesChartType] = useState<ChartType>(() => {
    const savedType = localStorage.getItem('vehiclesChartType');
    return (savedType as ChartType) || 'bar';
  });
  const [vehiclesColors, setVehiclesColors] = useState(() => {
    const savedColors = localStorage.getItem('vehiclesColors');
    return savedColors ? JSON.parse(savedColors) : PRESET_SCHEMES.identifiedVehicles[0].colors;
  });
  const [vehiclesSettingsOpen, setVehiclesSettingsOpen] = useState(false);

  // Add state for Detected Objects colors and settings
  const [detectedObjectsColors, setDetectedObjectsColors] = useState(() => {
    const savedColors = localStorage.getItem('detectedObjectsColors');
    return savedColors ? JSON.parse(savedColors) : {
      person: '#ff4757',
      vehicle: '#2ed573',
      animal: '#ffa502',
      object: '#1e90ff'
    };
  });

  const [detectedObjectsSettingsOpen, setDetectedObjectsSettingsOpen] = useState(false);

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
              isDraggable={!isLayoutLocked}  // Add this
              isResizable={!isLayoutLocked}  // Add this
              onLayoutChange={(newLayout) => {
                if (!isLayoutLocked) {  // Add this condition
                  setLayouts({ lg: newLayout });
                  localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
                }
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
                              chartType={activityChartType}
                              barColors={barColors}
                              onChartTypeChange={(type) => setActivityChartType(type as ChartType)}
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
                              chartType={patternsChartType}
                              areaColors={dailyPatternsColors}  // Changed from barColors to areaColors
                              onChartTypeChange={(type) => setPatternsChartType(type as ChartType)}
                              onColorChange={(key: string, color: string) => {
                                const newColors = { ...dailyPatternsColors, [key]: color };
                                setDailyPatternsColors(newColors);
                                localStorage.setItem('dailyPatternsColors', JSON.stringify(newColors));
                              }}
                            />
                          case 'vehicles':
                            return <IdentifiedVehicles 
                              isDemoMode={isDemoMode} 
                              textColor={textColor}
                              chartType={vehiclesChartType}
                              colors={vehiclesColors}
                              onChartTypeChange={(type: ChartType) => {
                                setVehiclesChartType(type);
                                localStorage.setItem('vehiclesChartType', type);
                              }}
                              onColorChange={(key: string, color: string) => {
                                const newColors = { ...vehiclesColors, [key]: color };
                                setVehiclesColors(newColors);
                                localStorage.setItem('vehiclesColors', JSON.stringify(newColors));
                              }}
                            />
                          case 'calendar':
                            return <Calendar textColor={textColor} />
                          case 'colors':
                            return <PopularColors isDemoMode={isDemoMode} textColor={textColor} />
                          case 'objects':
                            return <DetectedObjects 
                              isDemoMode={isDemoMode} 
                              textColor={textColor}
                              colors={detectedObjectsColors}
                              onColorChange={(key: string, color: string) => {
                                const newColors = { ...detectedObjectsColors, [key]: color };
                                setDetectedObjectsColors(newColors);
                                localStorage.setItem('detectedObjectsColors', JSON.stringify(newColors));
                              }}
                            />
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
            const xOffset = (index + 1) * 60;

    return (
              <motion.div
                key={item.label}
                initial={{ scale: 0, x: 0 }}
                animate={{
                  scale: 1,
                  x: xOffset,
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
                  left: 90,
                  top: 40,
                  zIndex: 1199,
                  transformOrigin: 'center center'
                }}
              >
                <IconButton
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);  // Pass the event to the handler
                    }
                    if (item.label !== 'Theme') {  // Keep menu open for theme selection
                      setIsMenuOpen(false);
                    }
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

        {/* Color Menu Popover */}
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
                  setSelectedColor(pack.background);
                  localStorage.setItem('selectedColor', pack.background);
                  setColorAnchorEl(null);
                  // Removed setIsMenuOpen(false);  // No longer closing menu after selection
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

        {/* Settings Drawer */}
      <Box
        sx={{
          position: 'fixed',
          right: settingsDrawerOpen ? 20 : -500, // Increased from -300 to -500
          top: '50%',
          transform: 'translateY(-50%)',
          width: 450, // Increased from 250 to 450
          maxHeight: '80vh',
          overflow: 'auto',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
          p: 3, // Increased padding from 2 to 3
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1300,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
            },
          },
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
              <Box key={widget.id}>
                {(widget.id === 'activity' || widget.id === 'patterns' || widget.id === 'vehicles' || widget.id === 'objects') ? (
                  <Box>
                    {/* Component Dropdown Header */}
                    <ListItem
                      sx={{
                        mb: widget.id === 'objects' ? 
                          (detectedObjectsSettingsOpen ? 0 : 1) :
                          widget.id === 'vehicles' ? 
                          (vehiclesSettingsOpen ? 0 : 1) :
                          widget.id === 'patterns' ?
                          (dailyPatternsSettingsOpen ? 0 : 1) :
                          (activityHistoryView === 'hidden' ? 1 : 0),
                        borderRadius: widget.id === 'objects' ? 
                          (detectedObjectsSettingsOpen ? '4px 4px 0 0' : 1) :
                          widget.id === 'vehicles' ? 
                          (vehiclesSettingsOpen ? '4px 4px 0 0' : 1) :
                          widget.id === 'patterns' ?
                          (dailyPatternsSettingsOpen ? '4px 4px 0 0' : 1) :
                          (activityHistoryView === 'hidden' ? 1 : '4px 4px 0 0'),
                        backgroundColor: 'rgba(130, 202, 157, 0.1)',
                        cursor: 'pointer',
                        p: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(130, 202, 157, 0.2)',
                        },
                      }}
                      onClick={() => {
                        if (widget.id === 'objects') {
                          setDetectedObjectsSettingsOpen(!detectedObjectsSettingsOpen);
                        } else if (widget.id === 'vehicles') {
                          setVehiclesSettingsOpen(!vehiclesSettingsOpen);
                        } else if (widget.id === 'patterns') {
                          setDailyPatternsSettingsOpen(!dailyPatternsSettingsOpen);
                        } else if (widget.id === 'activity') {
                          setActivityHistoryView(prev => prev === 'hidden' ? 'default' : 'hidden');
                        }
                      }}
                    >
                      <ListItemText
                        primary={widget.title}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.875rem',
                            color: '#82ca9d'
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{ color: textColor }}
                      >
                        {widget.id === 'vehicles' ? 
                          (vehiclesSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />) :
                          widget.id === 'patterns' ?
                          (dailyPatternsSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />) :
                          widget.id === 'objects' ?
                          (detectedObjectsSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />) :
                          (activityHistoryView === 'hidden' ? <ChevronDown size={16} /> : <ChevronUp size={16} />)
                        }
                      </IconButton>
                    </ListItem>

                    {/* Expanded Settings */}
                    <Box
                      sx={{
                        height: widget.id === 'objects' ? 
                          (detectedObjectsSettingsOpen ? 'auto' : 0) :
                          widget.id === 'vehicles' ? 
                          (vehiclesSettingsOpen ? 'auto' : 0) :
                          widget.id === 'patterns' ?
                          (dailyPatternsSettingsOpen ? 'auto' : 0) :
                          (activityHistoryView === 'hidden' ? 0 : 'auto'),
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'rgba(130, 202, 157, 0.05)',
                        borderRadius: '0 0 4px 4px',
                        mb: widget.id === 'objects' ? 
                          (detectedObjectsSettingsOpen ? 1 : 0) :
                          widget.id === 'vehicles' ? 
                          (vehiclesSettingsOpen ? 1 : 0) :
                          widget.id === 'patterns' ?
                          (dailyPatternsSettingsOpen ? 1 : 0) :
                          (activityHistoryView === 'hidden' ? 0 : 1),
                        opacity: widget.id === 'objects' ? 
                          (detectedObjectsSettingsOpen ? 1 : 0) :
                          widget.id === 'vehicles' ? 
                          (vehiclesSettingsOpen ? 1 : 0) :
                          widget.id === 'patterns' ?
                          (dailyPatternsSettingsOpen ? 1 : 0) :
                          (activityHistoryView === 'hidden' ? 0 : 1),
                      }}
                    >
                      {((widget.id === 'objects' && detectedObjectsSettingsOpen) || 
                        (widget.id === 'vehicles' && vehiclesSettingsOpen) || 
                        (widget.id === 'patterns' && dailyPatternsSettingsOpen) || 
                        (widget.id === 'activity' && activityHistoryView !== 'hidden')) && (
                        <Box sx={{ p: 2 }}>
                          {/* Chart Type Selection */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ mb: 1, color: textColor, fontSize: '0.75rem' }}>Chart Type</Box>
                            <Select
                              value={widget.id === 'vehicles' ? vehiclesChartType : 
                                     widget.id === 'patterns' ? patternsChartType : 
                                     widget.id === 'objects' ? 'pie' :
                                     activityChartType}
                              onChange={handleChartTypeChange(widget.id)}
                              size="small"
                              fullWidth
                              sx={{
                                height: '32px',
                                fontSize: '0.875rem',
                                color: textColor,
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                '.MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '& .MuiSelect-icon': {
                                  color: textColor
                                }
                              }}
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                  }
                                }
                              }}
                            >
                              {widget.id === 'vehicles' ? 
                                ['bar', 'line'].map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </MenuItem>
                                )) :
                                widget.id === 'patterns' ? 
                                  ['bar', 'line', 'scatter', 'bubble'].map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </MenuItem>
                                )) :
                                widget.id === 'objects' ? 
                                  ['pie'].map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </MenuItem>
                                )) :
                                ['bar', 'line', 'scatter', 'bubble'].map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </MenuItem>
                                ))
                              }
                            </Select>
                          </Box>

                          {/* Color Themes */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ mb: 1, color: textColor, fontSize: '0.75rem' }}>Color Theme</Box>
                            {widget.id === 'vehicles' ? 
                              PRESET_SCHEMES.identifiedVehicles.map((scheme) => (
                                <Box
                                  key={scheme.name}
                                  onClick={() => {
                                    setVehiclesColors(scheme.colors);
                                    localStorage.setItem('vehiclesColors', JSON.stringify(scheme.colors));
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    backgroundColor: JSON.stringify(vehiclesColors) === JSON.stringify(scheme.colors) ? 
                                      'rgba(255, 255, 255, 0.1)' : 
                                      'transparent',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {Object.values(scheme.colors).map((color, index) => (
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
                                    fontSize: '0.75rem',
                                    flex: 1
                                  }}>
                                    {scheme.name}
                                  </Box>
                                </Box>
                              )) :
                              widget.id === 'patterns' ? 
                              PRESET_SCHEMES.dailyPatterns.map((scheme) => (
                                <Box
                                  key={scheme.name}
                                  onClick={() => {
                                    setDailyPatternsColors(scheme.colors);
                                    localStorage.setItem('dailyPatternsColors', JSON.stringify(scheme.colors));
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    backgroundColor: JSON.stringify(dailyPatternsColors) === JSON.stringify(scheme.colors) ? 
                                      'rgba(255, 255, 255, 0.1)' : 
                                      'transparent',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {Object.values(scheme.colors).map((color, index) => (
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
                                    fontSize: '0.75rem',
                                    flex: 1
                                  }}>
                                    {scheme.name}
                                  </Box>
                                </Box>
                              )) :
                              widget.id === 'objects' ? 
                              PRESET_SCHEMES.detectedObjects.map((scheme) => (
                                <Box
                                  key={scheme.name}
                                  onClick={() => {
                                    setDetectedObjectsColors(scheme.colors);
                                    localStorage.setItem('detectedObjectsColors', JSON.stringify(scheme.colors));
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    backgroundColor: JSON.stringify(detectedObjectsColors) === JSON.stringify(scheme.colors) ? 
                                      'rgba(255, 255, 255, 0.1)' : 
                                      'transparent',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {Object.values(scheme.colors).map((color, index) => (
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
                                    fontSize: '0.75rem',
                                    flex: 1
                                  }}>
                                    {scheme.name}
                                  </Box>
                                </Box>
                              )) :
                              COLOR_SETS.map((set) => (
                                <Box
                                  key={set.name}
                                  onClick={() => {
                                    setBarColors(set.colors);
                                    localStorage.setItem('activityBarColors', JSON.stringify(set.colors));
                                  }}
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
                                >
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                                    fontSize: '0.75rem',
                                    flex: 1
                                  }}>
                                    {set.name}
                                  </Box>
                                </Box>
                              ))
                            }
                          </Box>

                          {/* Preview */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ mb: 1, color: textColor, fontSize: '0.75rem' }}>Preview</Box>
                            <Box
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
                                cursor: 'grab',
                                '&:active': {
                                  cursor: 'grabbing'
                                },
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  transition: 'transform 0.2s ease'
                                }
                              }}
                            >
                              <GraphPreview
                                type={widget.id === 'vehicles' ? vehiclesChartType :
                                      widget.id === 'patterns' ? patternsChartType :
                                      widget.id === 'objects' ? 'pie' :
                                      activityChartType}
                                colors={widget.id === 'vehicles' ? vehiclesColors :
                                        widget.id === 'patterns' ? dailyPatternsColors :
                                        widget.id === 'objects' ? detectedObjectsColors :
                                        barColors}
                                textColor={textColor}
                              />
                            </Box>
                          </Box>

                          {/* Delete Button */}
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Trash2 size={16} />}
                            onClick={() => {
                              const newVisibleWidgets = visibleWidgets.filter(id => id !== widget.id);
                              setVisibleWidgets(newVisibleWidgets);
                              localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
                              if (widget.id === 'vehicles') {
                                setVehiclesSettingsOpen(false);
                              } else if (widget.id === 'patterns') {
                                setDailyPatternsSettingsOpen(false);
                              } else if (widget.id === 'objects') {
                                setDetectedObjectsSettingsOpen(false);
                              } else {
                                setActivityHistoryView('hidden');
                              }
                            }}
                            fullWidth
                            sx={{
                              mt: 2,
                              height: '32px',
                              fontSize: '0.75rem',
                              borderColor: 'rgba(255, 99, 99, 0.5)',
                              color: 'rgb(255, 99, 99)',
                              '&:hover': {
                                borderColor: 'rgba(255, 99, 99, 0.8)',
                                backgroundColor: 'rgba(255, 99, 99, 0.1)'
                              },
                              textTransform: 'none'
                            }}
                          >
                            Remove Component
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  // Other widgets with switch toggle
                  <ListItem
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
                )}
              </Box>
            ))}
          </List>
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
            <Route 
              path="/localconfig" 
              element={
                <ProtectedRoute>
                  <LocalConfig />
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
