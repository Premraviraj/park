import { Box } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useState, useMemo } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
)

const BAR_COLORS = {
  car: 'rgba(136, 132, 216, 1)',
  human: 'rgba(130, 202, 157, 1)',
  bike: 'rgba(141, 209, 225, 1)',
  truck: 'rgba(255, 198, 88, 1)',
  bus: 'rgba(255, 128, 66, 1)'
} as const

type ActivityType = keyof typeof BAR_COLORS

const generateData = () => {
  const data = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60000)
    
    data.push({
      time: i % 4 === 0 ?
        time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) 
        : '',
      displayTime: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      car: Math.floor(Math.random() * 30) + 10,
      human: Math.floor(Math.random() * 20) + 5,
      bike: Math.floor(Math.random() * 10) + 2,
      truck: Math.floor(Math.random() * 5) + 1,
      bus: Math.floor(Math.random() * 3)
    })
  }
  return data
}

interface ChartItem {
  time: string;
  displayTime: string;
  car: number;
  human: number;
  bike: number;
  truck: number;
  bus: number;
}

const ActivityHistory = () => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)
  const data = useMemo(() => generateData(), [])

  const chartData: ChartData<'bar'> = {
    labels: data.map((d: ChartItem) => d.time),
    datasets: Object.entries(BAR_COLORS).map(([key, color]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map((d: ChartItem) => d[key as ActivityType]),
      backgroundColor: selectedActivity ? 
        (selectedActivity === key ? color : 'rgba(70, 70, 70, 0.5)') : 
        color,
      borderColor: 'transparent',
      borderRadius: 4,
      borderSkipped: false,
      stack: 'stack1'
    }))
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      delay(context) {
        return context.dataIndex * 50;
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
          border: { display: false }
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          font: {
            size: 9
          },
          maxRotation: 0,
          autoSkip: false
        }
      },
      y: {
        stacked: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          border: { display: false }
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          font: {
            size: 9
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        titleFont: {
          size: 12
        },
        bodyColor: '#fff',
        bodyFont: {
          size: 11
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: (context) => {
            return data[context[0].dataIndex].displayTime;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: '250px', mb: 1 }}>
        <Bar data={chartData} options={options} />
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1.5,
          justifyContent: 'flex-start',
          ml: 2,
          pb: 1
        }}
      >
        {Object.entries(BAR_COLORS).map(([key, color]) => (
          <Box 
            key={key}
            onClick={() => setSelectedActivity(
              selectedActivity === key ? null : key as ActivityType
            )}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              opacity: selectedActivity && selectedActivity !== key ? 0.5 : 1,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              ...(selectedActivity === key && {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
              })
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: color
              }} 
            />
            <Box sx={{ 
              color: selectedActivity === key ? '#fff' : 'rgba(255, 255, 255, 0.7)', 
              fontSize: '0.75rem',
              fontWeight: selectedActivity === key ? 600 : 400
            }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default ActivityHistory