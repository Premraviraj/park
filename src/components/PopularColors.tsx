import { Box } from '@mui/material'
import { ResponsivePie } from '@nivo/pie'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const data = [
  { id: 'Black', value: 35, color: '#000000' },
  { id: 'White', value: 25, color: '#FFFFFF' },
  { id: 'Blue', value: 15, color: '#4169E1' },
  { id: 'Red', value: 10, color: '#FF4444' },
  { id: 'Gray', value: 8, color: '#808080' },
  { id: 'Beige', value: 4, color: '#F5F5DC' },
  { id: 'Green', value: 2, color: '#4CAF50' },
  { id: 'Yellow', value: 1, color: '#FFEB3B' }
]

const PopularColors = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [rotation, setRotation] = useState(-90)

  useEffect(() => {
    // Initial load animation
    const timer = setTimeout(() => {
      setRotation(270)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Rotation animation on selection
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
              color: getColor(item.id, item.color),
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
              text: { fill: 'rgba(255, 255, 255, 0.7)' },
              tooltip: {
                container: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'rgba(255, 255, 255, 0.7)',
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
                    bgcolor: datum.color,
                    border: datum.color === '#FFFFFF' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
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
                          fill: 'rgba(255, 255, 255, 0.9)',
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
                          fill: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {selectedItem}
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
          flexWrap: 'wrap',
          gap: 1.5,
          mt: 1,
          pl: 2,
          pr: 2,
          justifyContent: 'center'
        }}>
          <AnimatePresence>
            {data.map(({ id: label, color }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: selectedItem ? (selectedItem === label ? 1 : 0.5) : 1,
                  y: 0,
                  scale: selectedItem === label ? 1.1 : 1,
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                onClick={() => {
                  if (selectedItem === label) {
                    setSelectedItem(null)
                  } else {
                    setSelectedItem(label)
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  minWidth: 'fit-content',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: selectedItem === label ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}>
                  <Box 
                    sx={{ 
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: selectedItem ? getColor(label, color) : color,
                      border: color === '#FFFFFF' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                      flexShrink: 0,
                      boxShadow: selectedItem === label ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <Box sx={{ 
                    color: selectedItem === label ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)', 
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease'
                  }}>
                    {label}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      </Box>
    </motion.div>
  )
}

export default PopularColors