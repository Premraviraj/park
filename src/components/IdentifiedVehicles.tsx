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
import { useState, useEffect } from 'react'

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

interface IdentifiedVehiclesProps {
  isDemoMode: boolean;
}

const generateData = (currentTime: Date, minutes: number = 10, isDemoMode: boolean) => {
  const data = []
  
  for (let i = 0; i < minutes; i++) {
    const time = new Date(currentTime.getTime() - (minutes - 1 - i) * 60000)
    
    data.push({
      time: i % 2 === 0 ?
        time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) 
        : '',
      displayTime: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      in: isDemoMode ? Math.floor(Math.random() * 10) + 5 : 0,
      out: isDemoMode ? Math.floor(Math.random() * 10) + 5 : 0,
      unknown: isDemoMode ? Math.floor(Math.random() * 5) + 1 : 0
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

const IdentifiedVehicles = ({ isDemoMode }: IdentifiedVehiclesProps) => {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState(() => generateData(new Date(), 10, isDemoMode))
  const [isUpdating, setIsUpdating] = useState(false)
  const [timeRange, setTimeRange] = useState('10')
  const [chartType, setChartType] = useState<ChartType>('line')

  // Update data every minute
  useEffect(() => {
    const updateData = async () => {
      setIsUpdating(true)
      await new Promise(resolve => setTimeout(resolve, 200))
      setCurrentTime(new Date())
      setData(generateData(new Date(), parseInt(timeRange), isDemoMode))
      setIsUpdating(false)
    }

    const intervalId = setInterval(updateData, 60000)
    return () => clearInterval(intervalId)
  }, [timeRange, isDemoMode])

  // Update data immediately when selected type or timeRange changes
  useEffect(() => {
    setData(generateData(currentTime, parseInt(timeRange), isDemoMode))
  }, [selectedType, currentTime, timeRange, isDemoMode])

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value)
  }

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType)
  }

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
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          border: { display: false }
        },
        min: 0,
        max: 30,
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          font: {
            size: 9
          },
          stepSize: 5
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
      position: 'relative'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 1,
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

        <Select
          value={timeRange}
          onChange={handleTimeRangeChange}
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
            value="5" 
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
            Last 5 minutes
          </MenuItem>
          <MenuItem 
            value="10" 
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
            Last 10 minutes
          </MenuItem>
          <MenuItem 
            value="15" 
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
            Last 15 minutes
          </MenuItem>
          <MenuItem 
            value="30" 
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
            Last 30 minutes
          </MenuItem>
        </Select>
      </Box>

      {isUpdating && (
        <Box
          sx={{
            position: 'absolute',
            top: 28,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 1,
            borderRadius: 1
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }}
          />
        </Box>
      )}
      <Box sx={{ 
        height: 'calc(150px - 36px)',
        mb: 1 
      }}>
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

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1.5,
          justifyContent: 'flex-start',
          ml: 2,
          pb: 1,
          flexShrink: 0
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