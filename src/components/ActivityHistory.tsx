import { Box, IconButton } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartData,
  ChartOptions,
  Filler
} from 'chart.js'
import { Bar, Line, Scatter, Bubble } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

const BAR_COLORS = {
  car: 'rgba(136, 132, 216, 1)',
  human: 'rgba(130, 202, 157, 1)',
  bike: 'rgba(141, 209, 225, 1)',
  truck: 'rgba(255, 198, 88, 1)',
  bus: 'rgba(255, 128, 66, 1)'
} as const

type ActivityType = keyof typeof BAR_COLORS

// Add prop type
interface ActivityHistoryProps {
  isDemoMode: boolean;
  textColor: string;
  setActivitySettingsOpen: (open: boolean) => void;
  chartType: string;
  barColors: { [key: string]: string };
  onChartTypeChange: (type: string) => void;
  onColorChange: (key: string, color: string) => void;
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
      car: isDemoMode ? Math.floor(Math.random() * 15) + 5 : 0,
      human: isDemoMode ? Math.floor(Math.random() * 10) + 3 : 0,
      bike: isDemoMode ? Math.floor(Math.random() * 8) + 2 : 0,
      truck: isDemoMode ? Math.floor(Math.random() * 5) + 1 : 0,
      bus: isDemoMode ? Math.floor(Math.random() * 3) + 1 : 0
    })
  }
  console.log("generate a data",data);
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

type ChartType = 'bar' | 'line' | 'scatter' | 'bubble'

// Add gradient colors similar to AREA_COLORS
const GRADIENT_COLORS = {
  car: {
    color: BAR_COLORS.car,
    gradient: {
      light: 'rgba(136, 132, 216, 0.3)',
      dark: 'rgba(136, 132, 216, 0.1)'
    }
  },
  human: {
    color: BAR_COLORS.human,
    gradient: {
      light: 'rgba(130, 202, 157, 0.3)',
      dark: 'rgba(130, 202, 157, 0.1)'
    }
  },
  bike: {
    color: BAR_COLORS.bike,
    gradient: {
      light: 'rgba(141, 209, 225, 0.3)',
      dark: 'rgba(141, 209, 225, 0.1)'
    }
  },
  truck: {
    color: BAR_COLORS.truck,
    gradient: {
      light: 'rgba(255, 198, 88, 0.3)',
      dark: 'rgba(255, 198, 88, 0.1)'
    }
  },
  bus: {
    color: BAR_COLORS.bus,
    gradient: {
      light: 'rgba(255, 128, 66, 0.3)',
      dark: 'rgba(255, 128, 66, 0.1)'
    }
  }
} as const

// Add createGradient function
const createGradient = (ctx: CanvasRenderingContext2D, color: typeof GRADIENT_COLORS[ActivityType]) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, color.gradient.light)
  gradient.addColorStop(1, color.gradient.dark)
  return gradient
}

const ActivityHistory = ({ 
  isDemoMode, 
  textColor, 
  setActivitySettingsOpen,
  chartType,
  barColors,
  onChartTypeChange,
  onColorChange
}: ActivityHistoryProps) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState(() => generateData(new Date(), 10, isDemoMode))
  const [isUpdating, setIsUpdating] = useState(false)
  const [timeRange] = useState('10')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: boolean }>(() => ({
    car: true,
    human: true,
    bike: true,
    truck: true,
    bus: true
  }));
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Update data every minute
  useEffect(() => {
    const updateData = async () => {
      setIsUpdating(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200))
      setCurrentTime(new Date())
      setData(generateData(new Date(), parseInt(timeRange), isDemoMode))
      setIsUpdating(false)
    }

    const intervalId = setInterval(updateData, 60000)
    return () => clearInterval(intervalId)
  }, [timeRange, isDemoMode])

  // Update data immediately when selected activity changes
  useEffect(() => {
    setData(generateData(currentTime, parseInt(timeRange), isDemoMode))
  }, [selectedActivity, currentTime, timeRange, isDemoMode])

  const getChartData = (type: ChartType): ChartData<typeof type> => {
    const baseConfig = Object.entries(barColors)
      .filter(([key]) => filters[key])
      .map(([key, color]) => {
        const baseDataset = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          opacity: 1,
        }

        if (type === 'bar') {
          return {
            ...baseDataset,
            data: data.map((d: ChartItem) => d[key as ActivityType]),
            borderRadius: 4,
            borderSkipped: false,
            stack: 'stack1',
          }
        }

        if (type === 'line') {
          return {
            ...baseDataset,
            data: data.map((d: ChartItem) => d[key as ActivityType]),
            backgroundColor: (context) => {
              const ctx = context.chart.ctx
              const gradient = ctx.createLinearGradient(0, 0, 0, 400)
              gradient.addColorStop(0, color.replace('1)', '0.3)'))
              gradient.addColorStop(1, color.replace('1)', '0.1)'))
              return gradient
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          }
        }

        if (type === 'scatter' || type === 'bubble') {
          return {
            ...baseDataset,
            data: data.map((d: ChartItem, index) => ({
              x: index,
              y: d[key as ActivityType],
              r: type === 'bubble' ? d[key as ActivityType] / 3 : undefined
            })),
            pointRadius: 4,
            pointHoverRadius: 6,
          }
        }

        return baseDataset
      })

    return {
      labels: data.map((d: ChartItem) => d.time),
      datasets: baseConfig
    } as ChartData<typeof type>
  }

  const options: ChartOptions<ChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400,
      easing: 'easeOutQuart',
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
        min: 0,
        max: 50,
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          font: {
            size: 9
          },
          stepSize: 10
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

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    onChartTypeChange(event.target.value);
  }

  const handleFilterChange = (activityType: string) => {
    setFilters(prev => ({
      ...prev,
      [activityType]: !prev[activityType]
    }));
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      <>
        <IconButton
          onClick={() => setActivitySettingsOpen(true)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            padding: '4px',
            color: textColor,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Settings size={16} />
        </IconButton>
      </>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 1,
        mb: 1,
        mt: 1
      }}>
        {/* Remove the Select component that was here */}
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
        height: 'calc(250px - 36px)',
        mb: 1 
      }}>
        {(() => {
          switch (chartType) {
            case 'bar': {
              const barData = getChartData('bar')
              return <Bar data={barData} options={options} />
            }
            case 'line': {
              const lineData = getChartData('line')
              return <Line data={lineData} options={options} />
            }
            case 'scatter': {
              const scatterData = getChartData('scatter')
              return <Scatter data={scatterData} options={options} />
            }
            case 'bubble': {
              const bubbleData = getChartData('bubble')
              return <Bubble data={bubbleData} options={options} />
            }
            default: {
              const barData = getChartData('bar')
              return <Bar data={barData} options={options} />
            }
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
        {Object.entries(barColors)
          .filter(([key]) => filters[key])
          .map(([key, color]) => (
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
                  bgcolor: color,
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

export default ActivityHistory