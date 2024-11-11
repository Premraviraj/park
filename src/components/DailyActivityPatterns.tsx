import { Box, Select, MenuItem, SelectChangeEvent } from '@mui/material'
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
  car: {
    color: 'rgba(136, 132, 216, 1)',
    gradient: {
      light: 'rgba(136, 132, 216, 0.3)',
      dark: 'rgba(136, 132, 216, 0.1)'
    }
  },
  human: {
    color: 'rgba(130, 202, 157, 1)',
    gradient: {
      light: 'rgba(130, 202, 157, 0.3)',
      dark: 'rgba(130, 202, 157, 0.1)'
    }
  },
  bike: {
    color: 'rgba(141, 209, 225, 1)',
    gradient: {
      light: 'rgba(141, 209, 225, 0.3)',
      dark: 'rgba(141, 209, 225, 0.1)'
    }
  }
} as const

type ActivityType = keyof typeof AREA_COLORS

interface DailyActivityPatternsProps {
  isDemoMode: boolean;
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

type ChartType = 'bar' | 'line'

const DailyActivityPatterns = ({ isDemoMode }: DailyActivityPatternsProps) => {
  const data = useMemo(() => generateData(isDemoMode), [isDemoMode])
  const [chartType, setChartType] = useState<ChartType>('line')
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType)
  }

  const createGradient = (ctx: CanvasRenderingContext2D, color: typeof AREA_COLORS[ActivityType]) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, color.gradient.light)
    gradient.addColorStop(1, color.gradient.dark)
    return gradient
  }

  const chartData: ChartData<'line'> = {
    labels: data.map((d: ChartItem) => d.time),
    datasets: Object.entries(AREA_COLORS).map(([key, color]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map((d: ChartItem) => d[key as ActivityType]),
      borderColor: selectedActivity ? 
        (selectedActivity === key ? color.color : 'rgba(70, 70, 70, 0.5)') : 
        color.color,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx
        const gradient = createGradient(ctx, color)
        return selectedActivity ? 
          (selectedActivity === key ? gradient : 'rgba(70, 70, 70, 0.1)') : 
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
          border: { display: false }
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
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
          border: { display: false }
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
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
        justifyContent: 'flex-end',
        mb: 1
      }}>
        <Select
          value={chartType}
          onChange={handleChartTypeChange}
          size="small"
          sx={{
            height: '28px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: '#2A2A2A',
            '& .MuiSelect-select': {
              padding: '4px 14px',
              fontWeight: 600,
            },
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: '#404040',
              borderWidth: 2,
            },
            '&:hover': {
              backgroundColor: '#333333',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: '#505050',
                borderWidth: 2,
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#333333',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: '#606060',
                borderWidth: 2,
              },
            },
            '.MuiSvgIcon-root': {
              color: '#ffffff',
            }
          }}
        >
          <MenuItem 
            value="bar" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#2A2A2A',
              '&.Mui-selected': {
                backgroundColor: '#404040',
              },
              '&:hover': {
                backgroundColor: '#333333',
              }
            }}
          >
            Bar Chart
          </MenuItem>
          <MenuItem 
            value="line" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#2A2A2A',
              '&.Mui-selected': {
                backgroundColor: '#404040',
              },
              '&:hover': {
                backgroundColor: '#333333',
              }
            }}
          >
            Line Chart
          </MenuItem>
        </Select>
      </Box>

      <Box sx={{ height: '180px', mb: '2px' }}>
        {(() => {
          switch (chartType) {
            case 'bar':
              return <Bar data={chartData} options={options} />
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
        {Object.entries(AREA_COLORS).map(([key, value]) => (
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
              p: '2px',
              borderRadius: 1,
              minWidth: 'fit-content',
              height: '20px',
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
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: value.color,
                flexShrink: 0
              }} 
            />
            <Box sx={{ 
              color: selectedActivity === key ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.7rem',
              fontWeight: selectedActivity === key ? 600 : 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
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