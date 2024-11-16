import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import SpinnerLoader from './SpinnerLoader';
import { LayoutItem } from '../types/dashboard';
import { CircularMenu } from './CircularMenu';
import { SettingsDrawer } from './SettingsDrawer';
import { Menu, MenuItem } from '@mui/material';
import GsapBackground from './GsapBackground';
import gsap from 'gsap';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const THEMES = [
  {
    name: 'Cosmic',
    color: '#6B46C1',
    gradient: `linear-gradient(135deg, 
      rgba(50, 0, 100, 0.95) 0%,
      rgba(107, 70, 193, 0.95) 50%,
      rgba(150, 100, 255, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Northern Lights',
    color: '#00B4D8',
    gradient: `linear-gradient(135deg,
      rgba(0, 31, 63, 0.95) 0%,
      rgba(0, 180, 216, 0.95) 50%,
      rgba(72, 202, 228, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Sunset Fusion',
    color: '#F72585',
    gradient: `linear-gradient(135deg,
      rgba(247, 37, 133, 0.95) 0%,
      rgba(114, 9, 183, 0.95) 50%,
      rgba(58, 12, 163, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Emerald Dream',
    color: '#2ECC71',
    gradient: `linear-gradient(135deg,
      rgba(26, 188, 156, 0.95) 0%,
      rgba(46, 204, 113, 0.95) 50%,
      rgba(39, 174, 96, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Deep Ocean',
    color: '#0A2463',
    gradient: `linear-gradient(135deg,
      rgba(10, 36, 99, 0.95) 0%,
      rgba(13, 71, 161, 0.95) 50%,
      rgba(25, 118, 210, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Cyber Punk',
    color: '#FF0080',
    gradient: `linear-gradient(135deg,
      rgba(255, 0, 128, 0.95) 0%,
      rgba(101, 31, 255, 0.95) 50%,
      rgba(0, 249, 236, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Dark Matter',
    color: '#1A1A1A',
    gradient: `linear-gradient(135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(51, 51, 51, 0.95) 50%,
      rgba(77, 77, 77, 0.95) 100%
    )`,
    textColor: '#ffffff'
  },
  {
    name: 'Royal Gold',
    color: '#FFD700',
    gradient: `linear-gradient(135deg,
      rgba(139, 69, 19, 0.95) 0%,
      rgba(218, 165, 32, 0.95) 50%,
      rgba(255, 215, 0, 0.95) 100%
    )`,
    textColor: '#ffffff'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.98);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({ lg: [] });
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>([]);
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    return savedTheme ? JSON.parse(savedTheme) : THEMES[0];
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Load saved settings
        const savedLayout = localStorage.getItem('dashboardLayout');
        const savedVisibleWidgets = localStorage.getItem('visibleWidgets');
        const savedLockState = localStorage.getItem('isLayoutLocked');
        const savedTheme = localStorage.getItem('selectedTheme');

        // Initialize states with saved data
        if (savedLayout) {
          setLayouts({ lg: JSON.parse(savedLayout) });
        }
        if (savedVisibleWidgets) {
          setVisibleWidgets(JSON.parse(savedVisibleWidgets));
        }
        if (savedLockState) {
          setIsLayoutLocked(JSON.parse(savedLockState));
        }
        if (savedTheme) {
          setSelectedTheme(JSON.parse(savedTheme));
        }

        // Add a minimum loading time for smooth animation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fade out loader
        gsap.to('.loader-container', {
          opacity: 0,
          duration: 0.5,
          onComplete: () => setIsLoading(false)
        });
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  useEffect(() => {
    const handleDashboardUpdate = (event: CustomEvent) => {
      const { layout, visibleWidgets: newVisibleWidgets } = event.detail;
      setLayouts({ lg: layout });
      setVisibleWidgets(newVisibleWidgets);
    };

    window.addEventListener('dashboardUpdate', handleDashboardUpdate as EventListener);
    return () => {
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth * 0.98);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleLayoutChange = useCallback(async (newLayout: LayoutItem[]) => {
    if (!newLayout || newLayout.length === 0) return;
    
    try {
      // Will be replaced with MongoDB API call
      setLayouts({ lg: newLayout });
      localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
    } catch (error) {
      console.error('Error updating layout:', error);
    }
  }, []);

  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    try {
      // Will be replaced with MongoDB API call
      const newLayout = layouts.lg.filter(item => item.i !== widgetId);
      const newVisibleWidgets = visibleWidgets.filter(id => id !== widgetId);
      
      setLayouts({ lg: newLayout });
      setVisibleWidgets(newVisibleWidgets);
      
      localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
      localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  }, [layouts.lg, visibleWidgets]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleThemeClick = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme);
    localStorage.setItem('selectedTheme', JSON.stringify(theme));
    setThemeMenuAnchor(null);
  };

  if (isLoading) {
    return (
      <Box className="loader-container">
        <SpinnerLoader />
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <GsapBackground 
        color={selectedTheme.color}
        gradient={selectedTheme.gradient}
      />
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          p: { xs: 1, sm: 1.5, md: 2 },
          m: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'all 0.5s ease-in-out',
          background: 'transparent'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 1, sm: 1.5, md: 2 },
          color: selectedTheme.textColor,
          fontSize: { xs: '1rem', sm: '1.125rem' },
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Box
            component="img"
            src="/src/assets/logo.webp"
            alt="Logo"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              padding: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          />
        </Box>

        <CircularMenu
          isOpen={isMenuOpen}
          textColor={selectedTheme.textColor}
          isLayoutLocked={isLayoutLocked}
          onSettingsClick={() => setSettingsDrawerOpen(true)}
          onThemeClick={handleThemeClick}
          onDownloadClick={() => {}}
          onLockClick={() => {
            setIsLayoutLocked(!isLayoutLocked);
            localStorage.setItem('isLayoutLocked', JSON.stringify(!isLayoutLocked));
          }}
          onLogoutClick={handleLogout}
        />

        <Menu
          anchorEl={themeMenuAnchor}
          open={Boolean(themeMenuAnchor)}
          onClose={() => setThemeMenuAnchor(null)}
          PaperProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              mt: 1,
              maxHeight: '80vh',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)'
                }
              }
            }
          }}
        >
          {THEMES.map((theme) => (
            <MenuItem
              key={theme.name}
              onClick={() => handleThemeSelect(theme)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                minWidth: 250,
                color: theme.textColor,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: theme.gradient,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: selectedTheme.name === theme.name ? 
                    '0 0 0 2px rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)' : 
                    '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  transform: selectedTheme.name === theme.name ? 'scale(1.1)' : 'scale(1)'
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: selectedTheme.name === theme.name ? 600 : 400,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {theme.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        <DashboardLayout
          layouts={layouts}
          containerWidth={containerWidth}
          isLayoutLocked={isLayoutLocked}
          visibleWidgets={visibleWidgets}
          textColor={selectedTheme.textColor}
          onLayoutChange={handleLayoutChange}
        />

        <SettingsDrawer
          isOpen={settingsDrawerOpen}
          onClose={() => setSettingsDrawerOpen(false)}
          textColor={selectedTheme.textColor}
          visibleWidgets={visibleWidgets}
          onDeleteWidget={handleDeleteWidget}
        />
      </Box>
    </motion.div>
  );
};

export default Dashboard; 