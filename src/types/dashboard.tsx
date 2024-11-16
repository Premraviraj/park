export type ChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'calendar' | 'colors' | 'table';
export type ActivityType = 'car' | 'human' | 'bike' | 'truck' | 'bus';
export type ActivityHistoryView = 'default' | 'compact' | 'detailed' | 'hidden';

// Base widget props that all widgets share
export interface BaseWidgetProps {
  textColor: string;
}

export interface ActivityHistoryProps extends BaseWidgetProps {
  data?: {
    timestamp: string;
    type: string;
    count: number;
  }[];
}

export interface DailyActivityPatternsProps extends BaseWidgetProps {
  data?: {
    time: string;
    activity: number;
  }[];
}

export interface IdentifiedVehiclesProps extends BaseWidgetProps {
  data?: {
    type: string;
    direction: 'in' | 'out';
    count: number;
  }[];
}

export interface CalendarProps extends BaseWidgetProps {
  data?: {
    date: string;
    events: number;
  }[];
}

export interface PopularColorsProps extends BaseWidgetProps {
  data?: {
    color: string;
    count: number;
  }[];
}

export interface DetectedObjectsProps extends BaseWidgetProps {
  data?: {
    type: string;
    count: number;
  }[];
}

export interface DetectedObjectsByCameraProps extends BaseWidgetProps {
  data?: {
    camera: string;
    detections: {
      type: string;
      count: number;
    }[];
  }[];
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
}

export interface DashboardLayoutProps {
  layouts: { lg: LayoutItem[] };
  containerWidth: number;
  isLayoutLocked: boolean;
  visibleWidgets: string[];
  textColor: string;
  onLayoutChange: (layout: LayoutItem[]) => void;
}

export interface AutoTableOutput {
  finalY: number;
}

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
} 