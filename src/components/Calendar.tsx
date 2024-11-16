import { Box, Grid, Typography, Tooltip } from '@mui/material'
import { CalendarProps } from '../types/dashboard'
import { useState, useEffect } from 'react'

const Calendar = ({ textColor }: CalendarProps) => {
  const [currentDate] = useState(new Date())
  const [events, setEvents] = useState<Record<string, { count: number; intensity: number }>>({})
  
  // Generate random events for demo
  useEffect(() => {
    const newEvents: Record<string, { count: number; intensity: number }> = {}
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    
    for (let i = 1; i <= daysInMonth; i++) {
      if (Math.random() > 0.5) {
        const count = Math.floor(Math.random() * 50) + 1
        newEvents[i] = {
          count,
          intensity: count > 35 ? 1 : count > 20 ? 0.7 : 0.4
        }
      }
    }
    setEvents(newEvents)
  }, [currentDate])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const getEventColor = (intensity: number) => {
    return `rgba(130, 202, 157, ${intensity})`
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      color: textColor,
      p: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: 2
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #82ca9d, #4facfe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center'
        }}>
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: getEventColor(0.4)
          }} />
          <Typography variant="caption">Low</Typography>
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: getEventColor(0.7)
          }} />
          <Typography variant="caption">Medium</Typography>
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: getEventColor(1)
          }} />
          <Typography variant="caption">High</Typography>
        </Box>
      </Box>
      
      <Grid container spacing={1}>
        {days.map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography 
              align="center" 
              sx={{ 
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <Grid item xs={12/7} key={`empty-${index}`}>
            <Box sx={{ aspectRatio: '1', opacity: 0 }} />
          </Grid>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const event = events[day]
          
          return (
            <Grid item xs={12/7} key={index}>
              <Tooltip 
                title={event ? `${event.count} events` : 'No events'}
                placement="top"
              >
                <Box sx={{ 
                  aspectRatio: '1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: event ? getEventColor(event.intensity) : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    zIndex: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  },
                  ...(currentDate.getDate() === day && {
                    border: '2px solid #82ca9d',
                    fontWeight: 'bold'
                  })
                }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: event ? 500 : 400,
                      color: event ? (event.intensity > 0.7 ? '#000' : textColor) : textColor
                    }}
                  >
                    {day}
                  </Typography>
                  {event && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: event.intensity > 0.7 ? '#000' : '#82ca9d'
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default Calendar