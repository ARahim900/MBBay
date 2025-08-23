// Unified Design System Theme Configuration
export const theme = {
  // Color Palette - As specified in the requirement
  colors: {
    // Core chart colors
    primary: '#2D9CDB',      // Primary data series, lines, active elements
    secondary: '#FF5B5B',    // Secondary data series or comparisons
    accent: '#F7C604',       // Highlights or tertiary data
    background: '#FFFFFF',   // Component backgrounds
    textPrimary: '#111827',  // Main titles and important figures
    textSecondary: '#6B7280', // Labels, subtitles, secondary text
    gridLines: '#F3F2F7',    // Chart grid lines and gauge tracks
    
    // Extended palette for additional data series
    extended: {
      purple: '#8b5cf6',
      indigo: '#6366f1',
      teal: '#14b8a6',
      orange: '#f97316',
      pink: '#ec4899',
      green: '#22c55e',
    },
    
    // Status Colors
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Dark Mode Colors (for future use)
    dark: {
      bg: '#0f172a',
      surface: '#1e293b',
      card: '#334155',
      border: '#475569',
      text: '#f1f5f9',
      muted: '#94a3b8',
    }
  },
  
  // Typography - As specified in the requirement
  typography: {
    fontFamily: "'Inter', sans-serif",
    titleSize: '1.25rem',     // 20px - for main titles
    labelSize: '0.875rem',    // 14px - for labels and subtitles
    tooltipSize: '0.75rem',   // 12px - for tooltips
    // Extended sizes for flexibility
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Border Radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  // Chart-specific styling configuration
  charts: {
    // Main chart colors array
    colors: [
      '#2D9CDB', // Primary
      '#FF5B5B', // Secondary
      '#F7C604', // Accent
      '#8b5cf6', // Purple
      '#14b8a6', // Teal
      '#f97316', // Orange
      '#22c55e', // Green
      '#6366f1', // Indigo
    ],
    // Line chart styling
    line: {
      strokeWidth: 3,        // Line thickness
      dotSize: 6,           // Data point size
      dotBorderWidth: 2,    // Data point border
      curved: true,         // Use smooth curves (splines)
    },
    // Bar chart styling
    bar: {
      borderRadius: 4,      // Corner radius for top corners
      hoverOpacity: 0.85,   // Opacity on hover
    },
    // Pie/Donut chart styling
    pie: {
      strokeWidth: 12,      // Stroke width for gauge
      innerRadiusRatio: 0.6, // For doughnut style (60% of outer radius)
    },
    // Grid styling
    grid: {
      strokeDasharray: '3 3',
      opacity: 0.1,
    },
    // Gradient configurations
    gradients: {
      primary: 'linear-gradient(180deg, #2D9CDB 0%, rgba(45, 156, 219, 0) 100%)',
      secondary: 'linear-gradient(180deg, #FF5B5B 0%, rgba(255, 91, 91, 0) 100%)',
      accent: 'linear-gradient(180deg, #F7C604 0%, rgba(247, 198, 4, 0) 100%)',
    }
  }
};

// Utility functions for theme usage
export const getColorValue = (colorPath: string) => {
  const keys = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return colorPath; // Return original if not found
  }
  
  return value;
};

export const createGradient = (color1: string, color2: string, direction = '135deg') => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

// Theme fallback utility for safe theme value access
export const getThemeValue = (path: string, fallback: string) => {
  try {
    const keys = path.split('.');
    let value: any = theme;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null) {
        console.warn(`Theme value not found: ${path}, using fallback: ${fallback}`);
        return fallback;
      }
    }
    
    return value;
  } catch (error) {
    console.warn(`Error accessing theme value: ${path}, using fallback: ${fallback}`);
    return fallback;
  }
};