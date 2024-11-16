import { Box, Popover, IconButton, SelectChangeEvent } from '@mui/material'
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
import { Line, Bar } from 'react-chartjs-2'
import { useState, useMemo } from 'react'
import { Settings } from 'lucide-react'

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

const GRADIENT_COLORS = {
  car: {
    name: 'Ocean Flow',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  human: {
    name: 'Spring Warmth',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    color: '#84fab0'
  },
  bike: {
    name: 'Purple Dusk',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    color: '#a18cd1'
  }
} as const

type ActivityType = keyof typeof GRADIENT_COLORS

interface DailyActivityPatternsProps {
  isDemoMode: boolean;
  textColor: string;
  setDailyPatternsSettingsOpen?: (open: boolean) => void;
  chartType: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
}

const generateData = (isDemoMode: boolean) => {
  const data = []
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      time: hour % 4 === 0 ? `${hour.toString().padStart(2, '0')}:00` : '',
      displayTime: `${hour.toString().padStart(2, '0')}:00`,
      car: isDemoMode ? Math.floor(Math.sin(hour/24 * Math.PI) * 50 + 60) : 0,
      human: isDemoMode ? Math.floor(Math.sin((hour+2)/24 * Math.PI) * 30 + 40) : 0,
      bike: isDemoMode ? Math.floor(Math.sin((hour+4)/24 * Math.PI) * 20 + 25) : 0
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
}

type ChartType = 'bar' | 'line' | 'scatter' | 'bubble';

const DailyActivityPatterns = ({ 
  isDemoMode, 
  textColor,
  setDailyPatternsSettingsOpen,
  chartType,
}: DailyActivityPatternsProps) => {
  const data = useMemo(() => generateData(isDemoMode), [isDemoMode])
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)

  const chartData: ChartData<'line'> = {
    labels: data.map((d: ChartItem) => d.time),
    datasets: Object.entries(GRADIENT_COLORS).map(([key, colorConfig]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map((d: ChartItem) => d[key as ActivityType]),
      borderColor: selectedActivity ? 
        (selectedActivity === key ? colorConfig.color : 'rgba(128, 128, 128, 0.5)') : 
        colorConfig.color,
      backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
        const ctx = context.chart.ctx
        const gradient = ctx.createLinearGradient(0, 0, 0, 400)
        if (selectedActivity && selectedActivity !== key) {
          gradient.addColorStop(0, 'rgba(128, 128, 128, 0.3)')
          gradient.addColorStop(1, 'rgba(128, 128, 128, 0.1)')
        } else {
          gradient.addColorStop(0, colorConfig.color + '80') // 50% opacity
          gradient.addColorStop(1, colorConfig.color + '20') // 12% opacity
        }
        return gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: selectedActivity === key ? 2 : 1,
      borderDash: selectedActivity && selectedActivity !== key ? [] : undefined
    }))
  }

  const options: ChartOptions<ChartType> = {
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
        },
        ticks: {
          color: textColor,
          font: {
            size: 10
          },
          maxRotation: 0,
          autoSkip: false
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
        },
        ticks: {
          color: textColor,
          font: {
            size: 10
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
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
    }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        position: 'relative'
      }}>
        <Box sx={{ 
          fontSize: '1rem',
          color: textColor,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%'
        }}>
          Daily Activity Patterns
          <IconButton
            onClick={() => setDailyPatternsSettingsOpen?.(true)}
            sx={{
              padding: '4px',
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              marginLeft: 'auto',
              width: 24,
              height: 24,
            }}
          >
            <Settings size={14} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ height: '180px', mb: '2px' }}>
        {(() => {
          switch (chartType) {
            case 'bar':
              return <Bar data={chartData as ChartData<'bar'>} options={options} />
            case 'line':
              return <Line data={chartData} options={options} />
            default:
              return <Line data={chartData} options={options} />
          }
        })()}
      </Box>

      <Box sx={{ 
        display: 'flex',
        gap: 1.5,
        justifyContent: 'flex-start',
        pl: 1,
        height: '24px',
        alignItems: 'center',
      }}>
        {Object.entries(GRADIENT_COLORS).map(([key, colorConfig]) => (
          <Box 
            key={key}
            onClick={() => {
              if (selectedActivity === key) {
                setSelectedActivity(null);
              } else {
                setSelectedActivity(key as ActivityType);
              }
            }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              opacity: selectedActivity && selectedActivity !== key ? 0.3 : 1,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)',
              },
              ...(selectedActivity === key && {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-1px)',
              })
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                background: colorConfig.gradient,
                border: '1px solid rgba(255, 255, 255, 0.2)'
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

export default DailyActivityPatterns