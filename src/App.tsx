import { Box, Grid, ThemeProvider, createTheme, Button, useTheme, useMediaQuery, Switch, FormControlLabel } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Login from './pages/auth/Login'
import ActivityHistory from './components/ActivityHistory'
import DetectedObjects from './components/DetectedObjects'
import IdentifiedVehicles from './components/IdentifiedVehicles'
import DailyActivityPatterns from './components/DailyActivityPatterns'
import DetectedObjectsByCamera from './components/DetectedObjectsByCamera'
import PopularColors from './components/PopularColors'
import Calendar from './components/Calendar'
import { LogOut } from 'lucide-react'
import SpinnerLoader from './components/SpinnerLoader'
import { useState, useEffect } from 'react'
import logo from './assets/logo.webp'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: 'rgba(255, 255, 255, 0.05)'
    }
  }
})

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

const Dashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [username, setUsername] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [isDemoMode, setIsDemoMode] = useState(true)

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
        // Add your actual data loading logic here
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
        return `${greeting}, Administrator ${username}`
      case 'security':
        return `${greeting}, Officer ${username}`
      case 'manager':
        return `${greeting}, Manager ${username}`
      default:
        return `${greeting}, ${username}`
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
          bgcolor: 'background.default', 
          minHeight: '100vh',
          p: { xs: 1, sm: 1.5, md: 2 },
          m: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          borderRight: { xs: 'none', md: '24px solid #121212' },
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
            </motion.div>

            {/* Updated Welcome Message */}
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
                  onChange={(e) => setIsDemoMode(e.target.checked)}
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
                bgcolor: 'background.paper',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Scene analysis cameras
                </Box>
                <Box sx={{ 
                  fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                  color: '#fff' 
                }}>
                  {isDemoMode ? '2' : '0'}
                </Box>
              </Box>
            </Grid>

            {/* Total count */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Total count
                </Box>
                <Box sx={{ 
                  fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                  color: '#fff' 
                }}>
                  {isDemoMode ? '4.9k' : '0'}
                </Box>
              </Box>
            </Grid>

            {/* People count (last 5 minutes) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  People count (last 5 minutes)
                </Box>
                <Box sx={{ 
                  fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  {isDemoMode ? (
                    <>
                      2
                      <Box component="span" sx={{ color: '#f44336', fontSize: '1rem', ml: 1 }}>↓</Box>
                    </>
                  ) : '0'}
                </Box>
              </Box>
            </Grid>

            {/* Vehicle count (last 5 minutes) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Vehicle count (last 5 minutes)
                </Box>
                <Box sx={{ 
                  fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  {isDemoMode ? (
                    <>
                      0
                      <Box component="span" sx={{ color: '#f44336', fontSize: '1rem', ml: 1 }}>↓</Box>
                    </>
                  ) : '0'}
                </Box>
              </Box>
            </Grid>

            {/* People count (peak hour) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  People count (peak hour)
                </Box>
                <Box sx={{ 
                  fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                  color: '#fff' 
                }}>
                  {isDemoMode ? '259' : '0'}
                </Box>
              </Box>
            </Grid>

            {/* Vehicle count (peak hour) */}
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: 2,
                height: { xs: '80px', sm: '90px', md: '100px' },
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1,
                  fontSize: { xs: FONT_SIZES.xs, sm: FONT_SIZES.sm, md: FONT_SIZES.md }
                }}>
                  Vehicle count (peak hour)
                </Box>
                <Box sx={{ 
                  fontSize: { xs: FONT_SIZES.xl, sm: FONT_SIZES['2xl'], md: FONT_SIZES['3xl'] }, 
                  color: '#fff' 
                }}>
                  {isDemoMode ? '473' : '0'}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Grid 
            container 
            spacing={{ xs: 1, sm: 1.5, md: 2 }}
            sx={{ 
              m: 0,
              width: 'auto'
            }}
          >
            {/* Left Column */}
            <Grid item xs={12} md={8}>
              <Grid 
                container 
                spacing={{ xs: 1, sm: 1.5, md: 2 }}
                direction="column"
                sx={{
                  m: 0,
                  width: 'auto'
                }}
              >
                {/* Activity History */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    p: { xs: 1, sm: 1.5, md: 2 },
                    borderRadius: 2,
                    height: { xs: '250px', sm: '300px', md: '350px' },
                  }}>
                    <Box sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      mb: 0.5, 
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Activity history
                    </Box>
                    <ActivityHistory isDemoMode={isDemoMode} />
                  </Box>
                </Grid>

                {/* Identified Vehicles */}
                <Grid item>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 2,
                    mt: 1.5,
                    height: '250px',
                  }}>
                    <Box sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      mb: 0.5, 
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Identified vehicles
                    </Box>
                    <Box sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '0.8rem',
                      mb: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      License plates detected by camera
                    </Box>
                    <IdentifiedVehicles isDemoMode={isDemoMode} />
                  </Box>
                </Grid>

                {/* Detected Objects and Detected Objects by Camera */}
                <motion.div variants={itemVariants}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        bgcolor: 'background.paper',
                        p: 1.5,
                        borderRadius: 2,
                        mt: 1.5,
                        height: '325px',
                      }}>
                        <Box sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          mb: 0.5, 
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          Detected objects
                        </Box>
                        <Box sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)', 
                          fontSize: '0.8rem',
                          mb: 0.5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          by type
                        </Box>
                        <DetectedObjects isDemoMode={isDemoMode} />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ 
                        bgcolor: 'background.paper',
                        p: 1.5,
                        borderRadius: 2,
                        mt: 1.5,
                        height: '325px',
                      }}>
                        <Box sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          mb: 0.5, 
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          Detected objects
                        </Box>
                        <Box sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)', 
                          fontSize: '0.8rem',
                          mb: 0.5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          by camera
                        </Box>
                        <DetectedObjectsByCamera isDemoMode={isDemoMode} />
                      </Box>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={4}>
              <Grid 
                container 
                spacing={{ xs: 1, sm: 1.5, md: 2 }}
                direction="column"
                sx={{
                  m: 0,
                  width: 'auto'
                }}
              >
                {/* Daily activity patterns */}
                <Grid item>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 2,
                    height: '285px',
                  }}>
                    <Box sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      mb: 0.5, 
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Daily activity patterns
                    </Box>
                    <Box sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      fontSize: '0.8rem',
                      mb: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Average object detections during the hours of a day
                    </Box>
                    <DailyActivityPatterns isDemoMode={isDemoMode} />
                  </Box>
                </Grid>

                {/* Calendar */}
                <Grid item>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 2,
                    height: '180px',
                  }}>
                    <Calendar />
                  </Box>
                </Grid>

                {/* Popular T-shirt colors */}
                <Grid item>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 2,
                    mt: 1.5,
                    height: '300px',
                  }}>
                    <Box sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      mb: 0.5, 
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Popular T-shirt colors
                    </Box>
                    <PopularColors isDemoMode={isDemoMode} />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </motion.div>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ 
          width: '100vw', 
          height: '100vh',
          bgcolor: 'background.default',
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
      </ThemeProvider>
    </Router>
  )
}

export default App
