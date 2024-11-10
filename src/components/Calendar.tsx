import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Download } from '@mui/icons-material'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Update the type declaration - combine both interfaces into one
declare module 'jspdf' {
  interface jsPDF {
    autoTable: ((options: {
      startY?: number;
      head?: string[][];
      body: string[][];
      theme?: string;
      headStyles?: {
        fillColor: number[];
      };
      margin?: {
        left: number;
      };
    }) => any) & {
      previous: {
        finalY: number;
      };
    };
  }
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const resetToToday = () => {
    setSelectedDate(new Date())
  }

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const handleDownload = async () => {
    try {
      const pdf = new jsPDF()
      const timestamp = new Date().toLocaleString()

      // Title
      pdf.setFontSize(20)
      pdf.setTextColor(40, 40, 40)
      pdf.text('Dashboard Report', 20, 20)

      // Timestamp
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${timestamp}`, 20, 30)

      // Stats Summary
      pdf.setFontSize(14)
      pdf.setTextColor(40, 40, 40)
      pdf.text('Statistics Summary', 20, 45)

      const statsData = [
        ['Scene Analysis Cameras', '2'],
        ['Total Count', '4.9k'],
        ['People Count (Last 5 min)', '2'],
        ['Vehicle Count (Last 5 min)', '0'],
        ['Peak Hour People Count', '259'],
        ['Peak Hour Vehicle Count', '473']
      ]

      pdf.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] },
        margin: { left: 20 }
      })

      // Activity Summary
      pdf.setFontSize(14)
      pdf.text('Activity Summary', 20, pdf.autoTable.previous.finalY + 20)

      const activityData = [
        ['Cars Detected', '45%'],
        ['Humans Detected', '30%'],
        ['Bikes Detected', '15%'],
        ['Trucks Detected', '7%'],
        ['Buses Detected', '3%']
      ]

      pdf.autoTable({
        startY: pdf.autoTable.previous.finalY + 25,
        head: [['Object Type', 'Percentage']],
        body: activityData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] },
        margin: { left: 20 }
      })

      // Camera Details
      pdf.setFontSize(14)
      pdf.text('Camera Analysis', 20, pdf.autoTable.previous.finalY + 20)

      const cameraData = [
        ['South Parking (Q1656-LE)', '60%'],
        ['Parking exit (Q1656)', '40%']
      ]

      pdf.autoTable({
        startY: pdf.autoTable.previous.finalY + 25,
        head: [['Camera Location', 'Detection Share']],
        body: cameraData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] },
        margin: { left: 20 }
      })

      // Popular Colors Analysis
      pdf.setFontSize(14)
      pdf.text('T-Shirt Color Analysis', 20, pdf.autoTable.previous.finalY + 20)

      const colorData = [
        ['Black', '35%'],
        ['White', '25%'],
        ['Blue', '15%'],
        ['Red', '10%'],
        ['Gray', '8%'],
        ['Other Colors', '7%']
      ]

      pdf.autoTable({
        startY: pdf.autoTable.previous.finalY + 25,
        head: [['Color', 'Percentage']],
        body: colorData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40] },
        margin: { left: 20 }
      })

      // Notes
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text('* This report is auto-generated based on current dashboard data', 20, pdf.autoTable.previous.finalY + 20)
      pdf.text('* All percentages are approximate values', 20, pdf.autoTable.previous.finalY + 25)

      // Save the PDF
      const reportTimestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
      pdf.save(`dashboard-report-${reportTimestamp}.pdf`)

    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ height: '100%' }}
    >
      <Box sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 0.5,
        position: 'relative'
      }}>
        {/* Download Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1,
            p: 1, // Added padding for better click area
            cursor: 'pointer'
          }}
          onClick={handleDownload}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '18px',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            />
          </motion.div>
        </Box>

        {/* Header as button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: !isToday ? 'pointer' : 'default',
            opacity: !isToday ? 1 : 0.7,
            width: 'fit-content'
          }}
          onClick={() => !isToday && resetToToday()}
        >
          <Box sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            textAlign: 'center',
            fontWeight: 500,
            transition: 'color 0.3s ease',
            '&:hover': {
              color: !isToday ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)'
            }
          }}>
            {!isToday ? 'Click to show current date' : 'Current Date'}
          </Box>
        </motion.div>

        {/* Date navigation */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          px: 1,
        }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '1.5rem',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)'
                }
              }}
              onClick={() => changeDate(-1)}
            />
          </motion.div>

          <motion.div
            key={formattedDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ 
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80%',
              mx: 'auto'
            }}>
              {formattedDate}
            </Box>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '1.5rem',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)'
                }
              }}
              onClick={() => changeDate(1)}
            />
          </motion.div>
        </Box>

        {/* Live Time display */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Box sx={{ 
            fontSize: '1.5rem',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            fontWeight: 600,
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '2px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(255,255,255,0.1)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }
          }}>
            {formattedTime}
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  )
}

export default Calendar