import { Box } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useState, useEffect } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
)

interface IdentifiedVehiclesProps {
  isDemoMode: boolean;
  textColor: string;
  chartType: ChartType;
  colors: Record<string, string>;
  onChartTypeChange: (type: ChartType) => void;
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
      in: isDemoMode ? Math.floor(Math.random() * 10) + 5 : 0,
      out: isDemoMode ? Math.floor(Math.random() * 10) + 5 : 0
    })
  }
  return data
}

interface ChartItem {
  time: string;
  displayTime: string;
  in: number;
  out: number;
}

type ChartType = 'bar' | 'line';

type VehicleType = 'in' | 'out';

const IdentifiedVehicles = ({ isDemoMode, textColor, chartType, colors, onChartTypeChange, onColorChange }: IdentifiedVehiclesProps) => {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState(() => generateData(new Date(), 10, isDemoMode))
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const updateData = async () => {
      setIsUpdating(true)
      await new Promise(resolve => setTimeout(resolve, 200))
      setCurrentTime(new Date())
      setData(generateData(new Date(), 10, isDemoMode))
      setIsUpdating(false)
    }

    const intervalId = setInterval(updateData, 60000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    setData(generateData(currentTime, 10, isDemoMode))
  }, [selectedType, currentTime])

  const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, color.replace('1)', '0.3)'))
    gradient.addColorStop(1, color.replace('1)', '0.1)'))
    return gradient
  }

  const chartData = {
    labels: data.map((d: ChartItem) => d.time),
    datasets: Object.entries(colors).map(([key, color]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map((d: ChartItem) => d[key as VehicleType]),
      borderColor: selectedType ? 
        (selectedType === key ? color : 'rgba(200, 200, 200, 0.7)') : 
        color,
      backgroundColor: chartType === 'bar' ? color : createGradient(document.createElement('canvas').getContext('2d')!, color),
      fill: chartType === 'line',
      tension: 0.4,
      borderWidth: selectedType === key ? 2 : 1,
      borderDash: selectedType && selectedType !== key ? [5, 5] : undefined
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          },
          stepSize: 5
        },
        min: 0,
        max: 20
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          title: (tooltipItems: any) => {
            return data[tooltipItems[0].dataIndex].displayTime;
          }
        }
      }
    }
  } as const;

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
          Identified Vehicles
        </Box>
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
        height: 'calc(100% - 80px)',
        minHeight: '200px',
        position: 'relative'
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
        {Object.entries(colors).map(([key, color]) => (
          <Box 
            key={key}
            onClick={() => {
              if (selectedType === key) {
                setSelectedType(null);
              } else {
                setSelectedType(key as VehicleType);
              }
            }}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              opacity: selectedType && selectedType !== key ? 0.7 : 1,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)',
              },
              ...(selectedType === key && {
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