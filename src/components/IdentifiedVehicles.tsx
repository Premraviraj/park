import { Box, Select, MenuItem, SelectChangeEvent, Popover } from '@mui/material'
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
import { HexColorPicker } from 'react-colorful'
import { Settings } from 'lucide-react'
import { IconButton, Drawer, FormControlLabel, Switch } from '@mui/material'

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

interface IdentifiedVehiclesProps {
  isDemoMode: boolean;
  textColor: string;
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

type ChartType = 'bar' | 'line'

type VehicleType = 'in' | 'out' | 'unknown';

const IdentifiedVehicles = ({ isDemoMode, textColor }: IdentifiedVehiclesProps) => {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [data, setData] = useState(() => generateData(new Date(), 10, isDemoMode))
  const [isUpdating, setIsUpdating] = useState(false)
  const [timeRange, setTimeRange] = useState('10')
  const [chartType, setChartType] = useState<ChartType>('line')

  // Add color picker states
  const [vehicleColors, setVehicleColors] = useState(() => {
    const savedColors = localStorage.getItem('identifiedVehiclesColors')
    return savedColors ? JSON.parse(savedColors) : {
      in: 'rgba(130, 202, 157, 1)',
      out: 'rgba(244, 67, 54, 1)',
      unknown: 'rgba(102, 102, 102, 1)'
    }
  });

  const [colorPickerAnchor, setColorPickerAnchor] = useState<{
    element: HTMLElement | null;
    type: VehicleType | null;
  }>({ element: null, type: null });

  // Add color change handler
  const handleColorChange = (color: string) => {
    if (colorPickerAnchor.type) {
      const newColors = {
        ...vehicleColors,
        [colorPickerAnchor.type]: color
      };
      setVehicleColors(newColors);
      localStorage.setItem('identifiedVehiclesColors', JSON.stringify(newColors));
    }
  };

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

  useEffect(() => {
    setData(generateData(currentTime, parseInt(timeRange), isDemoMode))
  }, [selectedType, currentTime, timeRange, isDemoMode])

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value)
  }

  const handleChartTypeChange = (event: SelectChangeEvent<ChartType>) => {
    setChartType(event.target.value as ChartType)
  }

  const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, color.replace('1)', '0.3)'))
    gradient.addColorStop(1, color.replace('1)', '0.1)'))
    return gradient
  }

  const chartData: ChartData<'line'> = {
    labels: data.map((d: ChartItem) => d.time),
    datasets: Object.entries(vehicleColors).map(([key, color]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      data: data.map((d: ChartItem) => d[key as VehicleType]),
      borderColor: selectedType ? 
        (selectedType === key ? color : 'rgba(200, 200, 200, 0.7)') : 
        color,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx
        return selectedType ? 
          (selectedType === key ? createGradient(ctx, color) : 'rgba(200, 200, 200, 0.3)') : 
          createGradient(ctx, color)
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: selectedType === key ? 2 : 1,
      borderDash: selectedType && selectedType !== key ? [] : undefined,
      hidden: false,
      order: selectedType === key ? 1 : 2,
      zIndex: selectedType === key ? 2 : 1
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
        },
        filter: (tooltipItem) => {
          if (!selectedType) return true;
          return tooltipItem.datasetIndex === datasets.findIndex(d => d.label?.toLowerCase() === selectedType);
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
          <IconButton
            onClick={() => setFilterDrawerOpen(true)}
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
            color: textColor,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '& .MuiSelect-select': {
              padding: '4px 14px',
              fontWeight: 600,
            },
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
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
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
            color: textColor,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '& .MuiSelect-select': {
              padding: '4px 14px',
              fontWeight: 600,
            },
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
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
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
              color: textColor,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
        {Object.entries(vehicleColors).map(([key, color]) => (
          <Box 
            key={key}
            onClick={() => {
              if (selectedType === key) {
                setSelectedType(null);
              } else {
                setSelectedType(key as VehicleType);
              }
            }}
            onDoubleClick={(e) => {
              if (e.currentTarget === colorPickerAnchor.element) {
                setColorPickerAnchor({ element: null, type: null });
              } else {
                setColorPickerAnchor({ 
                  element: e.currentTarget as HTMLElement, 
                  type: key as VehicleType 
                });
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

      <Popover
        open={Boolean(colorPickerAnchor.element)}
        anchorEl={colorPickerAnchor.element}
        onClose={() => setColorPickerAnchor({ element: null, type: null })}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <HexColorPicker 
            color={colorPickerAnchor.type ? vehicleColors[colorPickerAnchor.type] : '#000000'}
            onChange={handleColorChange}
            style={{ width: '200px' }}
          />
        </Box>
      </Popover>
    </Box>
  )
}

export default IdentifiedVehicles