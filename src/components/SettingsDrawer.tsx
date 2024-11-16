import { Box, IconButton, List, ListItem, ListItemText, Collapse, Typography } from '@mui/material';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  textColor: string;
  visibleWidgets: string[];
  onDeleteWidget: (widgetId: string) => void;
}

const PreviewPlaceholder = ({ textColor }: { textColor: string }) => (
  <Box
    sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 1
    }}
  >
    <Typography sx={{ color: textColor, opacity: 0.7 }}>
      No data available
    </Typography>
  </Box>
);

export const SettingsDrawer = ({
  isOpen,
  onClose,
  textColor,
  visibleWidgets,
  onDeleteWidget
}: SettingsDrawerProps) => {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  const widgets = [
    { 
      id: 'activity', 
      title: 'Activity History'
    },
    { 
      id: 'patterns', 
      title: 'Daily Activity Patterns'
    },
    { 
      id: 'vehicles', 
      title: 'Identified Vehicles'
    },
    { 
      id: 'calendar', 
      title: 'Calendar'
    },
    { 
      id: 'colors', 
      title: 'Popular T-shirt Colors'
    },
    { 
      id: 'objects', 
      title: 'Detected Objects'
    },
    { 
      id: 'objectsByCamera', 
      title: 'Objects by Camera'
    }
  ];

  const handleDelete = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteWidget(widgetId);
    if (expandedWidget === widgetId) {
      setExpandedWidget(null);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        right: isOpen ? 20 : -500,
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
        zIndex: 1300
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
          onClick={onClose}
          sx={{
            padding: '8px',
            color: 'rgb(255, 99, 99)',
            '&:hover': {
              backgroundColor: 'rgba(255, 99, 99, 0.1)',
            }
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      <List sx={{ p: 0 }}>
        {widgets.map((widget) => (
          <Box key={widget.id}>
            <ListItem
              sx={{
                mb: expandedWidget === widget.id ? 0 : 1,
                borderRadius: expandedWidget === widget.id ? '4px 4px 0 0' : 1,
                backgroundColor: 'rgba(130, 202, 157, 0.1)',
                p: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(130, 202, 157, 0.2)',
                }
              }}
              onClick={() => setExpandedWidget(expandedWidget === widget.id ? null : widget.id)}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {visibleWidgets.includes(widget.id) && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(widget.id, e)}
                    sx={{
                      color: 'rgb(255, 99, 99)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 99, 99, 0.1)'
                      }
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  sx={{ color: textColor }}
                >
                  {expandedWidget === widget.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </IconButton>
              </Box>
            </ListItem>

            <Collapse in={expandedWidget === widget.id}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'rgba(130, 202, 157, 0.05)',
                  borderRadius: '0 0 4px 4px',
                  mb: 1
                }}
              >
                <Box sx={{ mb: 1, color: textColor, fontSize: '0.75rem' }}>Preview</Box>
                <Box
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', widget.id);
                  }}
                  sx={{
                    height: '200px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    p: 2,
                    cursor: 'grab',
                    '&:active': {
                      cursor: 'grabbing'
                    }
                  }}
                >
                  <PreviewPlaceholder textColor={textColor} />
                </Box>
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>
    </Box>
  );
}; 