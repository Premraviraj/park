import { Box, Grid, ThemeProvider, createTheme, Button } from '@mui/material'
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
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
          p: 2,
          m: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          borderRight: '24px solid #121212',
        }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: FONT_SIZES.lg
        }}>
          <Box 
            component="img"
            src={logo}
            alt="Logo"
            sx={{ 
              height: '60px',
              width: '60px',
              objectFit: 'cover',
              borderRadius: '50%',
              filter: 'brightness(1)',
              transition: 'all 0.3s ease',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
              '&:hover': {
                filter: 'brightness(1.2)',
                cursor: 'pointer',
                transform: 'scale(1.05)',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }
            }}
          />
          <Button
            onClick={handleLogout}
            startIcon={<LogOut size={18} />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              fontSize: FONT_SIZES.lg,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Grid 
            container 
            spacing={3}
            sx={{ 
              mb: 3,
              m: 0,
              width: 'auto'
            }}
          >
            <Grid item xs={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: 2.5,
                borderRadius: 2,
                height: '100px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mb: 1.5,
                  fontSize: FONT_SIZES.md
                }}>
                  Scene analysis cameras
                </Box>
                <Box sx={{ fontSize: FONT_SIZES['3xl'], color: '#fff' }}>2</Box>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: 2.5,
                borderRadius: 2,
                height: '100px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, fontSize: FONT_SIZES.md }}>
                  Total count
                </Box>
                <Box sx={{ fontSize: '1.75rem', color: '#fff' }}>4.9k</Box>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: 2.5,
                borderRadius: 2,
                height: '100px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, fontSize: FONT_SIZES.md }}>
                  People count (last 5 minutes)
                </Box>
                <Box sx={{ 
                  fontSize: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#fff'
                }}>
                  2
                  <Box component="span" sx={{ color: '#f44336', fontSize: '1rem', ml: 1 }}>↓</Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: 2.5,
                borderRadius: 2,
                height: '100px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, fontSize: FONT_SIZES.md }}>
                  Vehicle count (last 5 minutes)
                </Box>
                <Box sx={{ 
                  fontSize: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#fff'
                }}>
                  0
                  <Box component="span" sx={{ color: '#f44336', fontSize: '1rem', ml: 1 }}>↓</Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: 2.5,
                borderRadius: 2,
                height: '100px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, fontSize: FONT_SIZES.md }}>
                  People count (peak hour)
                </Box>
                <Box sx={{ fontSize: '1.75rem', color: '#fff' }}>259</Box>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Box sx={{ 
                bgcolor: 'background.paper',
                p: 2.5,
                borderRadius: 2,
                height: '100px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }
              }}>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1.5, fontSize: FONT_SIZES.md }}>
                  Vehicle count (peak hour)
                </Box>
                <Box sx={{ fontSize: '1.75rem', color: '#fff' }}>473</Box>
              </Box>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Grid 
            container 
            spacing={1.5}
            sx={{ 
              m: 0,
              width: 'auto'
            }}
          >
            {/* Left Column */}
            <Grid item xs={8}>
              <Grid 
                container 
                spacing={1.5}
                direction="column"
                sx={{
                  m: 0,
                  width: 'auto'
                }}
              >
                {/* Activity History */}
                <motion.div variants={itemVariants}>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      bgcolor: 'background.paper',
                      p: 1.5,
                      borderRadius: 2,
                      height: '350px',
                    }}>
                      <Box sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        mb: 0.5, 
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        Activity history
                      </Box>
                      <Box sx={{ 
                        color: 'rgba(255, 255, 255, 0.5)', 
                        fontSize: '0.8rem',
                        mb: 0.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        Object detections per 5 minutes
                      </Box>
                      <ActivityHistory />
                    </Box>
                  </Grid>
                </motion.div>

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
                    <IdentifiedVehicles />
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
                        <DetectedObjects />
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
                        <DetectedObjectsByCamera />
                      </Box>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid>
            </Grid>

            {/* Right Column */}
            <Grid item xs={4}>
              <Grid 
                container 
                spacing={1.5}
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
                    <DailyActivityPatterns />
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
                    <PopularColors />
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
        </Box>
      </ThemeProvider>
    </Router>
  )
}

export default App
