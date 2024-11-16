export const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem'
};

export const GRADIENT_PACKS = [
  {
    name: 'Midnight',
    value: '#121212',
    gradient: 'linear-gradient(135deg, #121212 0%, #1a237e 100%)',
    background: 'linear-gradient(135deg, #121212 0%, #1a237e 100%)'
  },
  {
    name: 'Ocean',
    value: '#0A1929',
    gradient: 'linear-gradient(135deg, #0A1929 0%, #004d7a 100%)',
    background: 'linear-gradient(135deg, #0A1929 0%, #004d7a 100%)'
  },
  {
    name: 'Forest',
    value: '#1A2F1A',
    gradient: 'linear-gradient(135deg, #1A2F1A 0%, #2E7D32 100%)',
    background: 'linear-gradient(135deg, #1A2F1A 0%, #2E7D32 100%)'
  },
  {
    name: 'Sunset',
    value: '#1A1A2F',
    gradient: 'linear-gradient(135deg, #1A1A2F 0%, #FF6B6B 100%)',
    background: 'linear-gradient(135deg, #1A1A2F 0%, #FF6B6B 100%)'
  },
  {
    name: 'Aurora',
    value: '#1F1F1F',
    gradient: 'linear-gradient(135deg, #1F1F1F 0%, #00C9FF 100%)',
    background: 'linear-gradient(135deg, #1F1F1F 0%, #00C9FF 100%)'
  },
  {
    name: 'Volcanic',
    value: '#1A1A1A',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #FF4B2B 100%)',
    background: 'linear-gradient(135deg, #1A1A1A 0%, #FF4B2B 100%)'
  },
  {
    name: 'Raven',
    value: '#1E1E1E',
    gradient: 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)',
    background: 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
  }
];

export const DEFAULT_LAYOUT: LayoutItem[] = [];
export const INITIAL_VISIBLE_WIDGETS: string[] = [];

export const LAYOUT_CONFIG = {
  className: 'layout',
  cols: 12,
  rowHeight: 100,
  margin: [10, 10],
  containerPadding: [0, 0],
  maxRows: 30,
  isResizable: true,
  isDraggable: true,
  useCSSTransforms: true
}; 