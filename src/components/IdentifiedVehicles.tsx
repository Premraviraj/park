import { Box } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useState, useMemo } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

const AREA_COLORS = {
  in: {
    color: 'rgba(130, 202, 157, 1)',
    gradient: {
      light: 'rgba(130, 202, 157, 0.3)',
      dark: 'rgba(130, 202, 157, 0.1)'
    }
  },
  out: {
    color: 'rgba(244, 67, 54, 1)',
    gradient: {
      light: 'rgba(244, 67, 54, 0.3)',
      dark: 'rgba(244, 67, 54, 0.1)'
    }
  },
  unknown: {
    color: 'rgba(102, 102, 102, 1)',
    gradient: {
      light: 'rgba(102, 102, 102, 0.3)',
      dark: 'rgba(102, 102, 102, 0.1)'
    }
  }
} as const

type VehicleType = keyof typeof AREA_COLORS

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
      in: Math.floor(Math.random() * 50) + 20,
      out: Math.floor(Math.random() * 50) + 20,
      unknown: Math.floor(Math.random() * 10)
    })
  }
  return data
}

interface ChartItem {
  time: string;
  displayTime: string;
  in: number;
  out: number;
  unknown: number;
}

const IdentifiedVehicles = () => {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null)
  const data = useMemo(() => generateData(), [])

  const createGradient = (ctx: CanvasRenderingContext2D, color: typeof AREA_COLORS[VehicleType]) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, color.gradient.light)
    gradient.addColorStop(1, color.gradient.dark)
    return gradient
  }

  const chartData: ChartData<'line'> = {
    labels: data.map((d: ChartItem) => d.time),
    datasets: Object.entries(AREA_COLORS).map(([key, color]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map((d: ChartItem) => d[key as VehicleType]),
      borderColor: selectedType ? 
        (selectedType === key ? color.color : 'rgba(70, 70, 70, 0.5)') : 
        color.color,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx
        const gradient = createGradient(ctx, color)
        return selectedType ? 
          (selectedType === key ? gradient : 'rgba(70, 70, 70, 0.1)') : 
          gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2
    }))
  }

  const options: ChartOptions<'line'> = {
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
        grid: {
          display: false,
          drawBorder: false,
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
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          drawBorder: false,
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
      <Box sx={{ height: '150px', mb: 1 }}>
        <Line data={chartData} options={options} />
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
        {Object.entries(AREA_COLORS).map(([key, value]) => (
          <Box 
            key={key}
            onClick={() => setSelectedType(
              selectedType === key ? null : key as VehicleType
            )}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              opacity: selectedType && selectedType !== key ? 0.5 : 1,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              ...(selectedType === key && {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
              })
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: value.color
              }} 
            />
            <Box sx={{ 
              color: selectedType === key ? '#fff' : 'rgba(255, 255, 255, 0.7)', 
              fontSize: '0.75rem',
              fontWeight: selectedType === key ? 600 : 400
            }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default IdentifiedVehicles