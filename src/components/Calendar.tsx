import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const resetToToday = () => {
    setSelectedDate(new Date())
  }

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ height: '100%' }}
    >
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 0.5,
        position: 'relative'
      }}>
        {/* Header as button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: !isToday ? 'pointer' : 'default',
            opacity: !isToday ? 1 : 0.7,
            width: 'fit-content'
          }}
          onClick={() => !isToday && resetToToday()}
        >
          <Box sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontWeight: 500,
            transition: 'color 0.3s ease',
            '&:hover': {
              color: !isToday ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)'
            }
          }}>
            {!isToday ? 'Click to show current date' : 'Current Date'}
          </Box>
        </motion.div>

        {/* Date navigation */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          px: 1,
        }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '1.5rem',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)'
                }
              }}
              onClick={() => changeDate(-1)}
            />
          </motion.div>

          <motion.div
            key={formattedDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ 
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80%',
              mx: 'auto'
            }}>
              {formattedDate}
            </Box>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '1.5rem',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)'
                }
              }}
              onClick={() => changeDate(1)}
            />
          </motion.div>
        </Box>

        {/* Live Time display */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Box sx={{ 
            fontSize: '1.5rem',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            fontWeight: 600,
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '2px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(255,255,255,0.1)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }
          }}>
            {formattedTime}
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  )
}

export default Calendar