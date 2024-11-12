import { Card, CardContent, Typography, Box } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  trend?: 'up' | 'down'
  isDemoMode: boolean
}

const StatCard = ({ title, value, trend, isDemoMode }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0)
  const targetValue = typeof value === 'number' ? value : parseInt(value) || 0

  useEffect(() => {
    if (isDemoMode) {
      setDisplayValue(0)
      
      const duration = 1500
      const steps = 60
      const increment = targetValue / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        if (currentStep < steps) {
          setDisplayValue(prev => Math.min(prev + increment, targetValue))
          currentStep++
        } else {
          clearInterval(timer)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    } else {
      setDisplayValue(0)
    }
  }, [isDemoMode, targetValue])

  return (
    <Card sx={{ height: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" alignItems="center">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayValue}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h4" component="div">
                {isDemoMode ? Math.round(displayValue) : '0'}
              </Typography>
            </motion.div>
          </AnimatePresence>
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
            >
              <Box 
                ml={1} 
                color={trend === 'up' ? 'success.main' : 'error.main'}
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {trend === 'up' ? <TrendingUp /> : <TrendingDown />}
              </Box>
            </motion.div>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatCard 