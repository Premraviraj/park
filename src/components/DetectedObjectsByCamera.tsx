import { Box, Popover } from '@mui/material'
import { ResponsivePie } from '@nivo/pie'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

interface DetectedObjectsByCameraProps {
  isDemoMode: boolean;
  textColor: string;
}

const generateData = (isDemoMode: boolean) => [
  { 
    id: 'South Parking (Q1656-LE)', 
    value: isDemoMode ? 60 : 0, 
    color: '#4169E1' 
  },
  { 
    id: 'Parking exit (Q1656)', 
    value: isDemoMode ? 40 : 0, 
    color: '#40E0D0' 
  }
]

const DetectedObjectsByCamera = ({ isDemoMode, textColor }: DetectedObjectsByCameraProps) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [rotation, setRotation] = useState(-90)

  // Add color picker states
  const [pieColors, setPieColors] = useState(() => {
    const savedColors = localStorage.getItem('detectedObjectsByCameraColors')
    return savedColors ? JSON.parse(savedColors) : {
      'South Parking (Q1656-LE)': '#4169E1',
      'Parking exit (Q1656)': '#40E0D0'
    }
  });

  const [colorPickerAnchor, setColorPickerAnchor] = useState<{
    element: HTMLElement | null;
    type: string | null;
  }>({ element: null, type: null });

  // Add color change handler
  const handleColorChange = (color: string) => {
    if (colorPickerAnchor.type) {
      const newColors = {
        ...pieColors,
        [colorPickerAnchor.type]: color
      };
      setPieColors(newColors);
      localStorage.setItem('detectedObjectsByCameraColors', JSON.stringify(newColors));
    }
  };

  // Update the data generation to use pieColors
  const [data, setData] = useState(() => generateData(isDemoMode).map(item => ({
    ...item,
    color: pieColors[item.id]
  })))

  // Update data when colors change
  useEffect(() => {
    setData(generateData(isDemoMode).map(item => ({
      ...item,
      color: pieColors[item.id]
    })))
  }, [isDemoMode, pieColors])

  useEffect(() => {
    const timer = setTimeout(() => {
      setRotation(270)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedItem) {
      setRotation(prev => prev + 360)
    }
  }, [selectedItem])

  const getColor = (itemId: string, originalColor: string) => {
    if (!selectedItem) return originalColor
    return itemId === selectedItem ? originalColor : 'rgba(0, 0, 0, 0.5)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Box sx={{ width: '100%', height: '100%' }}>
        <Box sx={{ height: 200 }}>
          <ResponsivePie
            data={data.map(item => ({
              ...item,
              color: getColor(item.id, pieColors[item.id]),
              value: item.id === selectedItem ? item.value * 1.2 : item.value
            }))}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.6}
            padAngle={0.5}
            cornerRadius={3}
            colors={{ datum: 'data.color' }}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            animate={true}
            motionConfig={{
              mass: 0.8,
              tension: 150,
              friction: 20,
              clamp: false,
              precision: 0.01,
              velocity: 0
            }}
            startAngle={rotation}
            endAngle={rotation + 360}
            transitionMode="startAngle"
            theme={{
              background: 'transparent',
              text: { fill: textColor },
              tooltip: {
                container: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: textColor,
                  fontSize: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }
              }
            }}
            onClick={(data) => {
              if (selectedItem === data.id) {
                setSelectedItem(null)
              } else {
                setSelectedItem(data.id as string)
              }
            }}
            tooltip={({ datum }) => (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box 
                  sx={{ 
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: datum.color
                  }}
                />
                <span>{`${datum.id}: ${datum.value}`}</span>
              </Box>
            )}
            layers={[
              'arcs',
              'arcLabels',
              'arcLinkLabels',
              'legends',
              ({ centerX, centerY }) => (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {selectedItem && (
                    <>
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={30}
                        fill="rgba(0, 0, 0, 0.7)"
                      />
                      <text
                        x={centerX}
                        y={centerY - 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                          fontSize: '14px',
                          fill: textColor,
                          fontWeight: 'bold'
                        }}
                      >
                        {data.find(d => d.id === selectedItem)?.value}
                      </text>
                      <text
                        x={centerX}
                        y={centerY + 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                          fontSize: '12px',
                          fill: textColor,
                        }}
                      >
                        {selectedItem.length > 15 ? `${selectedItem.slice(0, 15)}...` : selectedItem}
                      </text>
                    </>
                  )}
                </motion.g>
              ),
            ]}
          />
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mt: 1,
          pl: 2,
          maxHeight: '80px',
          overflow: 'hidden'
        }}>
          <AnimatePresence>
            {data.map(({ id: label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: selectedItem ? (selectedItem === label ? 1 : 0.5) : 1,
                  x: 0,
                  scale: selectedItem === label ? 1.1 : 1,
                }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                onClick={() => {
                  if (selectedItem === label) {
                    setSelectedItem(null);
                  } else {
                    setSelectedItem(label);
                  }
                }}
                onDoubleClick={(e) => {
                  if (e.currentTarget === colorPickerAnchor.element) {
                    setColorPickerAnchor({ element: null, type: null });
                  } else {
                    setColorPickerAnchor({ 
                      element: e.currentTarget as HTMLElement, 
                      type: label 
                    });
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: selectedItem === label ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  transition: 'all 0.3s ease',
                  maxWidth: '100%'
                }}>
                  <Box 
                    sx={{ 
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: pieColors[label],
                      flexShrink: 0,
                      boxShadow: selectedItem === label ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                  <Box sx={{ 
                    color: selectedItem === label ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)', 
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 24px)',
                    transition: 'color 0.3s ease'
                  }}>
                    {label}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        <Popover
          open={Boolean(colorPickerAnchor.element)}
          anchorEl={colorPickerAnchor.element}
          onClose={() => setColorPickerAnchor({ element: null, type: null })}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            '& .MuiPopover-paper': {
              bgcolor: 'rgba(0, 0, 0, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 1
            }
          }}
        >
          <Box sx={{ p: 1 }}>
            <HexColorPicker 
              color={colorPickerAnchor.type ? pieColors[colorPickerAnchor.type] : '#000000'}
              onChange={handleColorChange}
              style={{ width: '200px' }}
            />
          </Box>
        </Popover>
      </Box>
    </motion.div>
  )
}

export default DetectedObjectsByCamera