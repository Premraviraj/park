import { Box, Typography, useMediaQuery } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { useState } from 'react';

interface DetectedObjectsByCameraProps {
  isDemoMode: boolean;
  textColor: string;
}

const DetectedObjectsByCamera = ({ isDemoMode, textColor }: DetectedObjectsByCameraProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isSmall = useMediaQuery('(max-width:600px)');

  const data = isDemoMode ? [
    {
      id: 'Camera 1',
      label: 'Camera 1',
      value: 45,
      color: '#FF4757'
    },
    {
      id: 'Camera 2',
      label: 'Camera 2',
      value: 30,
      color: '#2ED573'
    },
    {
      id: 'Camera 3',
      label: 'Camera 3',
      value: 15,
      color: '#1E90FF'
    },
    {
      id: 'Camera 4',
      label: 'Camera 4',
      value: 10,
      color: '#FFA502'
    }
  ] : [];

  const handleSelect = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const selectedItem = data.find(item => item.id === selectedId);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      color: textColor,
      p: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Objects by Camera
      </Typography>

      <Box sx={{ 
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <Box sx={{ 
          position: 'relative',
          flex: 1,
          minHeight: 0
        }}>
          <ResponsivePie
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.6}
            padAngle={0.5}
            cornerRadius={0}
            colors={{ datum: 'data.color' }}
            borderWidth={0}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            animate={true}
            motionConfig={{
              mass: 1,
              tension: 170,
              friction: 26,
              clamp: true,
              precision: 0.01
            }}
            onClick={(node) => handleSelect(node.id.toString())}
            isInteractive={true}
            activeOuterRadiusOffset={8}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              transition: 'opacity 0.3s ease',
              opacity: selectedItem ? 1 : 0
            }}
          >
            {selectedItem && (
              <Typography
                sx={{
                  fontSize: isSmall ? '1.25rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: selectedItem.color,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {selectedItem.value}%
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
          padding: '8px 0',
          marginTop: 'auto'
        }}>
          {data.map((item) => (
            <Box 
              key={item.id}
              onClick={() => handleSelect(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 1,
                backgroundColor: selectedId === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '3px',
                  backgroundColor: item.color,
                  flexShrink: 0
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: textColor,
                  fontWeight: selectedId === item.id ? 700 : 500,
                  fontSize: isSmall ? '0.7rem' : '0.75rem'
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DetectedObjectsByCamera;