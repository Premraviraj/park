import { IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette as PaletteIcon, Download, Lock, LogOut } from 'lucide-react';

interface CircularMenuProps {
  isOpen: boolean;
  textColor: string;
  isLayoutLocked: boolean;
  onSettingsClick: () => void;
  onThemeClick: (e: React.MouseEvent<HTMLElement>) => void;
  onDownloadClick: () => void;
  onLockClick: () => void;
  onLogoutClick: () => void;
}

export const CircularMenu = ({
  isOpen,
  textColor,
  isLayoutLocked,
  onSettingsClick,
  onThemeClick,
  onDownloadClick,
  onLockClick,
  onLogoutClick
}: CircularMenuProps) => {
  const menuItems = [
    { 
      icon: <Settings size={20} />, 
      label: 'Settings',
      onClick: onSettingsClick
    },
    { 
      icon: <PaletteIcon size={20} />, 
      label: 'Theme',
      onClick: onThemeClick
    },
    { 
      icon: <Download size={20} />, 
      label: 'Download Report',
      onClick: onDownloadClick
    },
    { 
      icon: (
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 0.3,
            times: [0, 0.5, 1]
          }}
        >
          <Lock 
            size={20}
            style={{
              transformOrigin: 'center',
              color: isLayoutLocked ? '#82ca9d' : undefined
            }}
          />
        </motion.div>
      ),
      label: isLayoutLocked ? 'Unlock Layout' : 'Lock Layout',
      onClick: onLockClick
    },
    { 
      icon: <LogOut size={20} />, 
      label: 'Logout',
      onClick: onLogoutClick
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && menuItems.map((item, index) => {
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
              onClick={item.onClick}
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
  );
}; 