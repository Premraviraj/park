import { Box } from '@mui/material';
import { ChartType } from '../types/dashboard';

interface GraphPreviewProps {
  type: ChartType;
  colors: Record<string, string>;
  textColor: string;
}

export const GraphPreview = ({ type, colors, textColor }: GraphPreviewProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '120px',
        border: `1px solid ${textColor}`,
        borderRadius: 1,
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {type === 'bar' && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 1, pt: 2, pb: 1 }}>
          {Object.entries(colors).map(([key, color], i) => (
            <Box
              key={key}
              sx={{
                width: '14px',
                height: `${30 + Math.random() * 50}%`,
                backgroundColor: color,
                borderRadius: '2px 2px 0 0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}
      {type === 'line' && (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={`M 0,${50 + Math.random() * 20} ${Object.values(colors).map((_, i) => 
                `L ${(i + 1) * (100 / Object.keys(colors).length)},${50 + Math.random() * 20}`
              ).join(' ')}`}
              stroke={Object.values(colors)[0]}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </Box>
      )}
      {type === 'pie' && (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {Object.entries(colors).map(([key, color], i) => {
              const angle = (360 / Object.keys(colors).length) * i;
              return (
                <circle
                  key={key}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={color}
                  strokeWidth="20"
                  strokeDasharray={`${20} ${180}`}
                  transform={`rotate(${angle}, 50, 50)`}
                />
              );
            })}
          </svg>
        </Box>
      )}
    </Box>
  );
}; 