# Unified Theme System - Usage Guide

## Overview
All chart components in the application now use a centralized theme configuration located at `src/lib/theme.ts`. This ensures visual consistency across all data visualizations.

## Theme Configuration

### Core Colors
```javascript
theme.colors.primary      // '#2D9CDB' - Primary data series, lines, active elements
theme.colors.secondary    // '#FF5B5B' - Secondary data series or comparisons  
theme.colors.accent       // '#F7C604' - Highlights or tertiary data
theme.colors.background   // '#FFFFFF' - Component backgrounds
theme.colors.textPrimary  // '#111827' - Main titles and important figures
theme.colors.textSecondary // '#6B7280' - Labels, subtitles, secondary text
theme.colors.gridLines    // '#F3F2F7' - Chart grid lines and gauge tracks
```

### Typography
```javascript
theme.typography.fontFamily // 'Inter', sans-serif
theme.typography.titleSize  // '1.25rem' (20px) - Chart titles
theme.typography.labelSize  // '0.875rem' (14px) - Labels, axes
theme.typography.tooltipSize // '0.75rem' (12px) - Tooltips
```

### Chart-Specific Styling
```javascript
// Line Charts
theme.charts.line.strokeWidth    // 3px - Line thickness
theme.charts.line.dotSize        // 6px - Data point size
theme.charts.line.dotBorderWidth // 2px - Data point border
theme.charts.line.curved         // true - Use smooth curves

// Bar Charts  
theme.charts.bar.borderRadius // 4px - Top corner radius
theme.charts.bar.hoverOpacity // 0.85 - Opacity on hover

// Pie/Donut Charts
theme.charts.pie.strokeWidth      // 12px - Stroke width
theme.charts.pie.innerRadiusRatio // 0.6 - For doughnut style
```

## How to Use the Theme

### Example 1: Area Chart
```jsx
import { theme } from './src/lib/theme';
import { ModernAreaChart } from './src/components/ui/ModernChart';

<ModernAreaChart
  data={data}
  config={{
    series1: { 
      label: 'Primary Series', 
      color: theme.colors.primary 
    },
    series2: { 
      label: 'Secondary Series', 
      color: theme.colors.secondary 
    }
  }}
  title="Monthly Trends"
  curved={true}
/>
```

### Example 2: Bar Chart
```jsx
<ModernBarChart
  data={data}
  config={{
    residential: { 
      label: 'Residential', 
      color: theme.colors.primary 
    },
    commercial: { 
      label: 'Commercial', 
      color: theme.colors.secondary 
    }
  }}
  title="Consumption by Type"
/>
```

### Example 3: Donut Chart
```jsx
<ModernDonutChart
  data={pieData}
  config={{
    value1: { 
      label: 'Category 1', 
      color: theme.colors.primary 
    },
    value2: { 
      label: 'Category 2', 
      color: theme.colors.accent 
    }
  }}
  title="Distribution"
/>
```

### Example 4: Custom Styled Components
```jsx
// Using theme for custom components
<div style={{
  backgroundColor: theme.colors.background,
  border: `1px solid ${theme.colors.gridLines}`
}}>
  <h2 style={{
    fontSize: theme.typography.titleSize,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily
  }}>
    Chart Title
  </h2>
  <p style={{
    fontSize: theme.typography.labelSize,
    color: theme.colors.textSecondary
  }}>
    Chart description
  </p>
</div>
```

## Migrating Existing Charts

### Before (Hardcoded Colors):
```jsx
config={{
  data1: { label: 'Data 1', color: '#3B82F6' },
  data2: { label: 'Data 2', color: '#10B981' }
}}
```

### After (Using Theme):
```jsx
import { theme } from './src/lib/theme';

config={{
  data1: { label: 'Data 1', color: theme.colors.primary },
  data2: { label: 'Data 2', color: theme.colors.extended.green }
}}
```

## Extended Color Palette
For additional data series beyond primary/secondary/accent:
```javascript
theme.colors.extended.purple // '#8b5cf6'
theme.colors.extended.indigo // '#6366f1'
theme.colors.extended.teal   // '#14b8a6'
theme.colors.extended.orange // '#f97316'
theme.colors.extended.pink   // '#ec4899'
theme.colors.extended.green  // '#22c55e'
```

## Making Theme Changes
To update the visual style across all charts:

1. Open `src/lib/theme.ts`
2. Modify the desired values
3. All charts will automatically reflect the changes

Example - Changing primary color:
```javascript
// In src/lib/theme.ts
colors: {
  primary: '#2D9CDB', // Change this to any color
  // ... rest of colors
}
```

## Best Practices

1. **Always import theme** when creating new chart components
2. **Never hardcode colors** - always reference theme values
3. **Use semantic color names** (primary, secondary) rather than specific colors
4. **Maintain consistency** - if a data type is always shown in primary color, keep it consistent across all charts
5. **Test theme changes** - When modifying theme, check all chart types to ensure they still look good

## Files Updated
- `src/lib/theme.ts` - Central theme configuration
- `src/components/ui/ModernChart.tsx` - Modern chart components with theme integration
- `src/components/ui/Chart.tsx` - Standard chart components with theme integration
- `App.tsx` - Main application using theme colors
- `src/components/ui/UnifiedChartExamples.tsx` - Complete examples of theme usage

## Support
For any issues or questions about the theme system, refer to the `UnifiedChartExamples.tsx` file for working examples of all chart types using the theme.