import { Card, CardContent, Typography, Box } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

interface StatCardProps {
  title: string
  value: string | number
  trend?: 'up' | 'down'
}

const StatCard = ({ title, value, trend }: StatCardProps) => {
  return (
    <Card sx={{ height: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {trend && (
            <Box ml={1} color={trend === 'up' ? 'success.main' : 'error.main'}>
              {trend === 'up' ? <TrendingUp /> : <TrendingDown />}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatCard 