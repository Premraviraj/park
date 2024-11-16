import { Box, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { ActivityHistoryProps } from '../types/dashboard';
import { useEffect, useState } from 'react';

const ActivityHistory = ({ textColor }: ActivityHistoryProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would fetch data from your backend
    const fetchData = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: textColor 
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      color: textColor
    }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Activity History
      </Typography>

      <Box sx={{ height: 'calc(100% - 40px)' }}>
        {data.length > 0 ? (
          <ResponsiveBar
            data={data}
            keys={['car', 'human', 'bike', 'truck', 'bus']}
            indexBy="timestamp"
            margin={{ top: 10, right: 10, bottom: 20, left: 30 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            colors={{ scheme: 'paired' }}
            borderRadius={3}
            borderWidth={0}
            enableLabel={false}
            enableGridY={false}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 5,
              tickRotation: 0,
              format: (value) => value,
              textColor: textColor
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 5,
              tickRotation: 0,
              format: (value) => `${value}%`,
              textColor: textColor
            }}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: textColor,
                    fontSize: 11
                  }
                }
              },
              grid: {
                line: {
                  stroke: 'rgba(255, 255, 255, 0.1)'
                }
              },
              tooltip: {
                container: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: textColor,
                  fontSize: '12px'
                }
              }
            }}
          />
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color={textColor}>No data available</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ActivityHistory;