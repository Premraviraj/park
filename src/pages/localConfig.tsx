import { Box, Grid, Typography, Paper, Button, useTheme, useMediaQuery, Popover, IconButton, List, ListItem, ListItemText, Select, MenuItem, Switch, FormControlLabel } from '@mui/material'
import { ArrowLeft, Download, Palette as PaletteIcon, Settings, Bell, HelpCircle, LogOut, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SpinnerLoader from '../components/SpinnerLoader'
import { useState, useEffect } from 'react'
import logo from '../assets/logo.webp'

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

const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem'
}

// Add gradient packs constant
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

// Add these type definitions
type ChartType = 'bar' | 'line' | 'scatter' | 'bubble';
type ActivityHistoryView = 'default' | 'compact' | 'detailed' | 'hidden';

// Add the widgets constant
const widgets = [
  { id: 'activity', title: 'Activity History' },
  { id: 'patterns', title: 'Daily Activity Patterns' },
  { id: 'vehicles', title: 'Identified Vehicles' },
  { id: 'calendar', title: 'Calendar' },
  { id: 'colors', title: 'Popular T-shirt Colors' },
  { id: 'objects', title: 'Detected Objects' },
  { id: 'objectsByCamera', title: 'Objects by Camera' }
];

const LocalConfig = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [selectedColor, setSelectedColor] = useState(() => {
    const savedColor = localStorage.getItem('selectedColor')
    return savedColor || '#121212'
  })
  const [textColor, setTextColor] = useState(() => {
    const savedTextColor = localStorage.getItem('textColor')
    return savedTextColor || '#ffffff'
  })
  const [colorAnchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [activityHistoryView, setActivityHistoryView] = useState<ActivityHistoryView>('default');
  const [detectedObjectsSettingsOpen, setDetectedObjectsSettingsOpen] = useState(false);
  const [vehiclesSettingsOpen, setVehiclesSettingsOpen] = useState(false);
  const [dailyPatternsSettingsOpen, setDailyPatternsSettingsOpen] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const savedVisibleWidgets = localStorage.getItem('visibleWidgets')
    return savedVisibleWidgets ? JSON.parse(savedVisibleWidgets) : widgets.map(w => w.id)
  });
  const [vehiclesChartType, setVehiclesChartType] = useState<ChartType>('bar');
  const [patternsChartType, setPatternsChartType] = useState<ChartType>('bar');
  const [activityChartType, setActivityChartType] = useState<ChartType>('bar');

  // Add contrast text color function
  const getContrastTextColor = (bgColor: string) => {
    const color = bgColor.includes('linear-gradient') 
      ? bgColor.match(/#[a-fA-F0-9]{6}/)?.[0] || '#FFFFFF'
      : bgColor;

    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    return luma < 180 ? '#FFFFFF' : '#000000';
  };

  // Add effect for updating colors
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

  // Simulate loading
  useState(() => {
    setTimeout(() => setIsLoading(false), 1000)
  })

  const handleDownloadReport = () => {
    // Add your download report logic here
    console.log('Downloading report...')
  }

  // Add handleLogout function
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // Add this function to handle theme change
  const handleThemeChange = (e: React.MouseEvent<HTMLElement>) => {
    setColorAnchorEl(e.currentTarget);
  };

  // Update the menuItems array
  const menuItems = [
    { 
      icon: <Settings size={20} />, 
      label: 'Settings',
      onClick: () => setSettingsDrawerOpen(true)
    },
    { 
      icon: <PaletteIcon size={20} />, 
      label: 'Theme',
      onClick: handleThemeChange  // Add theme handler
    },
    { 
      icon: <Download size={20} />, 
      label: 'Download Report',
      onClick: handleDownloadReport
    },
    { 
      icon: <Bell size={20} />, 
      label: 'Notifications' 
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

  // Add handleChartTypeChange function
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
          color: 'white',
          fontSize: { xs: FONT_SIZES.md, sm: FONT_SIZES.lg },
          flexWrap: 'wrap',
          gap: 1
        }}>
          {/* Logo Container */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
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
        </Box>

        {/* Add Settings Drawer */}
        <Box
          sx={{
            position: 'fixed',
            right: settingsDrawerOpen ? 20 : -500,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 450,
            maxHeight: '80vh',
            overflow: 'auto',
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            p: 3,
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

          <List sx={{ p: 0 }}>
            {widgets.map((widget) => (
              <Box key={widget.id}>
                {(widget.id === 'activity' || widget.id === 'patterns' || widget.id === 'vehicles' || widget.id === 'objects') ? (
                  <Box>
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
                        mb: 1,
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

                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Trash2 size={16} />}
                            onClick={() => {
                              const newVisibleWidgets = visibleWidgets.filter(id => id !== widget.id);
                              setVisibleWidgets(newVisibleWidgets);
                              localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
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
                  <ListItem
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

        {/* Add Circular Menu Items */}
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

        {/* Add Color Menu Popover */}
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
                  setIsMenuOpen(false);  // Close menu after selection
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
            {/* Config Card 1 */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{ 
                  bgcolor: textColor === '#ffffff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <Typography variant="h6" color="white" gutterBottom>
                  System Settings
                </Typography>
                <Typography color="rgba(255, 255, 255, 0.7)">
                  Configure core system settings and parameters
                </Typography>
              </Paper>
            </Grid>

            {/* Config Card 2 */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{ 
                  bgcolor: textColor === '#ffffff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <Typography variant="h6" color="white" gutterBottom>
                  User Management
                </Typography>
                <Typography color="rgba(255, 255, 255, 0.7)">
                  Manage user accounts and permissions
                </Typography>
              </Paper>
            </Grid>

            {/* Config Card 3 */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{ 
                  bgcolor: textColor === '#ffffff' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <Typography variant="h6" color="white" gutterBottom>
                  Security Settings
                </Typography>
                <Typography color="rgba(255, 255, 255, 0.7)">
                  Configure security and access controls
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content Area */}
        <motion.div variants={itemVariants}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '400px'
            }}
          >
            <Typography variant="h5" color="white" gutterBottom>
              Advanced Configuration
            </Typography>
            <Typography color="rgba(255, 255, 255, 0.7)" paragraph>
              Welcome to the advanced configuration panel. This area allows administrators to manage system-wide settings and configurations.
            </Typography>
            
            {/* Add your configuration content here */}
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  )
}

export default LocalConfig
