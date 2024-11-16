import { Box, Typography } from '@mui/material';
import GridLayout from 'react-grid-layout';
import { DashboardLayoutProps, LayoutItem } from '../types/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const WidgetPlaceholder = ({ title, textColor }: { title: string; textColor: string }) => (
  <Box sx={{ 
    height: '100%', 
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1,
    padding: 2
  }}>
    <Typography variant="h6" sx={{ mb: 2, color: textColor }}>
      {title}
    </Typography>
    <Box sx={{ 
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed rgba(255, 255, 255, 0.2)',
      borderRadius: 1
    }}>
      <Typography sx={{ color: textColor, opacity: 0.7 }}>
        No data available
      </Typography>
    </Box>
  </Box>
);

export const DashboardLayout = ({
  layouts = { lg: [] },
  containerWidth,
  isLayoutLocked,
  visibleWidgets = [],
  textColor,
  onLayoutChange
}: DashboardLayoutProps) => {
  const currentLayout = layouts.lg.filter(item => visibleWidgets.includes(item.i));

  const getWidgetTitle = (widgetId: string): string => {
    switch (widgetId) {
      case 'activity':
        return 'Activity History';
      case 'patterns':
        return 'Daily Activity Patterns';
      case 'vehicles':
        return 'Identified Vehicles';
      case 'calendar':
        return 'Calendar';
      case 'colors':
        return 'Popular T-shirt Colors';
      case 'objects':
        return 'Detected Objects';
      case 'objectsByCamera':
        return 'Objects by Camera';
      default:
        return 'Widget';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData('text/plain');
    
    if (widgetId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / (containerWidth / 12));
      const y = Math.floor((e.clientY - rect.top) / 100);

      const newLayoutItem: LayoutItem = {
        i: widgetId,
        x: Math.min(Math.max(0, x), 12 - 6),
        y,
        w: 6,
        h: 4,
        minW: 4,
        minH: 3
      };

      const newLayout = [...layouts.lg, newLayoutItem];
      const newVisibleWidgets = [...visibleWidgets, widgetId];
      
      onLayoutChange(newLayout);
      
      localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
      localStorage.setItem('visibleWidgets', JSON.stringify(newVisibleWidgets));
      
      window.dispatchEvent(new CustomEvent('dashboardUpdate', {
        detail: {
          layout: newLayout,
          visibleWidgets: newVisibleWidgets
        }
      }));
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 'calc(100vh - 200px)',
        position: 'relative',
        backgroundColor: 'transparent'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(130, 202, 157, 0.05)';
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onDrop={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        handleDrop(e);
      }}
    >
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={12}
        rowHeight={100}
        width={containerWidth}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={!isLayoutLocked}
        isResizable={!isLayoutLocked}
        onLayoutChange={(newLayout) => {
          if (newLayout.length > 0) {
            const updatedLayout = [
              ...layouts.lg.filter(item => !visibleWidgets.includes(item.i)),
              ...newLayout
            ];
            onLayoutChange(updatedLayout);
            localStorage.setItem('dashboardLayout', JSON.stringify(updatedLayout));
          }
        }}
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        compactType={null}
        preventCollision={true}
      >
        {currentLayout.map((item) => (
          <div key={item.i}>
            <WidgetPlaceholder 
              title={getWidgetTitle(item.i)} 
              textColor={textColor} 
            />
          </div>
        ))}
      </GridLayout>
    </Box>
  );
}; 