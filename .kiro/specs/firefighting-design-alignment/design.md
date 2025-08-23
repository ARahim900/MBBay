# Design Document

## Overview

This design document outlines the comprehensive revision of the firefighting and alarm section to align with the application's established visual style. The design focuses on replacing custom components with standardized UI components, implementing consistent color schemes, typography, and layout patterns while preserving all existing functionality.

## Architecture

### Component Hierarchy Alignment

The firefighting module will adopt the same architectural patterns used in other enhanced modules:

```
FirefightingDashboard (Main Container)
├── Header Section (Standardized)
├── MenuBar Navigation (Shared Component)
├── Dashboard Content (Grid Layout)
│   ├── KpiCard Components (Standardized)
│   ├── Card Components (Standardized)
│   └── Enhanced Firefighting Components
└── Sub-modules (Equipment, PPM, etc.)
```

### Design System Integration

All firefighting components will integrate with the centralized theme system:
- Import theme configuration from `src/lib/theme.ts`
- Use standardized UI components from `src/components/ui/`
- Follow established color, typography, and spacing patterns
- Maintain consistent hover effects and animations

## Components and Interfaces

### 1. FirefightingDashboard Component Redesign

**Current Issues:**
- Uses custom styling instead of theme colors
- Inconsistent button variants
- Custom card implementations
- Non-standard header layout

**Design Solution:**
```typescript
// Header alignment with other enhanced modules
const headerSection = {
  layout: "flex items-center justify-between mb-6",
  title: {
    typography: "text-2xl font-bold text-[#4E4456] dark:text-white",
    icon: "Flame icon with consistent styling"
  },
  subtitle: "text-sm text-gray-500",
  actions: "Button components with standard variants"
}

// Navigation alignment
const navigationSection = {
  component: "MenuBar from ui/glow-menu",
  styling: "mb-6 flex justify-center",
  menuItems: [
    {
      icon: "LayoutDashboard",
      gradient: "radial-gradient(circle, rgba(220,38,38,0.15)...)",
      iconColor: "text-red-500"
    }
    // ... other items following the same pattern
  ]
}
```

### 2. KPI Metrics Standardization

**Current Implementation:** Custom MetricCard components
**New Implementation:** Standard KpiCard components

```typescript
// Replace MetricCard with KpiCard
const kpiMetrics = [
  {
    component: "KpiCard",
    props: {
      title: "PPM Compliance",
      value: `${stats.complianceRate.toFixed(1)}%`,
      trend: { value: 5, isPositive: true, period: 'vs last month' },
      color: "green",
      icon: CheckCircle
    }
  },
  {
    component: "KpiCard", 
    props: {
      title: "Open Findings",
      value: findings.length.toString(),
      subtitle: `${stats.criticalFindings} Critical`,
      color: "orange",
      icon: AlertTriangle
    }
  }
  // ... additional KPI cards
]
```

### 3. SystemHealthIndicator Enhancement

**Design Approach:** Maintain functionality while adopting theme colors

```typescript
const healthIndicatorDesign = {
  colorScheme: {
    excellent: "theme.colors.status.success", // #10b981
    good: "theme.colors.status.warning",      // #f59e0b  
    fair: "theme.colors.extended.orange",     // #f97316
    poor: "theme.colors.status.error"         // #ef4444
  },
  typography: {
    percentage: "theme.typography.fontSize['3xl']",
    status: "theme.typography.fontSize.lg",
    subtitle: "theme.typography.fontSize.sm"
  },
  animations: {
    duration: "theme.animation.duration.normal",
    easing: "theme.animation.easing.default"
  }
}
```

### 4. BuildingHeatMap Visual Consistency

**Design Updates:**
- Use theme color palette for risk levels
- Standardize tooltip styling
- Implement consistent hover effects
- Align legend with application patterns

```typescript
const heatMapColors = {
  critical: "theme.colors.status.error",    // #ef4444
  high: "theme.colors.status.warning",      // #f59e0b
  medium: "theme.colors.status.info",       // #3b82f6
  low: "theme.colors.status.success"        // #10b981
}
```

### 5. UpcomingPPMCalendar Redesign

**Alignment Strategy:**
- Use standard Card component as container
- Apply theme colors for priority indicators
- Standardize button styling
- Implement consistent spacing patterns

```typescript
const calendarDesign = {
  container: "Card component with standard padding",
  priorityColors: {
    high: "theme.colors.status.error",
    medium: "theme.colors.status.warning", 
    low: "theme.colors.status.success"
  },
  typography: "theme.typography with consistent sizing",
  interactions: "Standard hover effects and transitions"
}
```

## Data Models

### Theme Integration Model

```typescript
interface ThemeAwareComponent {
  colors: {
    primary: string;    // theme.colors.primary
    secondary: string;  // theme.colors.secondary
    accent: string;     // theme.colors.accent
    status: {
      success: string;  // theme.colors.status.success
      warning: string;  // theme.colors.status.warning
      error: string;    // theme.colors.status.error
      info: string;     // theme.colors.status.info
    }
  };
  typography: {
    fontFamily: string; // theme.typography.fontFamily
    sizes: {
      title: string;    // theme.typography.titleSize
      label: string;    // theme.typography.labelSize
      tooltip: string;  // theme.typography.tooltipSize
    }
  };
  spacing: typeof theme.spacing;
  borderRadius: typeof theme.borderRadius;
  shadows: typeof theme.shadows;
}
```

### Component Standardization Model

```typescript
interface StandardizedFirefightingComponent {
  baseComponent: 'Card' | 'KpiCard' | 'Button' | 'MenuBar';
  themeProps: {
    variant?: string;
    color?: string;
    size?: string;
  };
  customProps: Record<string, any>;
  preservedFunctionality: string[];
}
```

## Error Handling

### Theme Fallback Strategy

```typescript
const getThemeColor = (colorPath: string, fallback: string) => {
  try {
    return getColorValue(colorPath) || fallback;
  } catch (error) {
    console.warn(`Theme color not found: ${colorPath}, using fallback: ${fallback}`);
    return fallback;
  }
};
```

### Component Migration Safety

- Gradual component replacement to avoid breaking changes
- Fallback to existing styling if theme values are unavailable
- Comprehensive testing of each component during migration
- Preservation of all existing functionality and data flows

## Testing Strategy

### Visual Consistency Testing

1. **Cross-Module Comparison**
   - Side-by-side comparison with EnhancedWaterModule
   - Color palette verification across all components
   - Typography consistency validation
   - Spacing and layout alignment checks

2. **Component Integration Testing**
   - KpiCard replacement verification
   - Card component styling validation
   - Button component behavior testing
   - MenuBar navigation functionality

3. **Theme Integration Testing**
   - Theme color application verification
   - Dark mode compatibility testing
   - Responsive design validation
   - Animation and transition consistency

### Functionality Preservation Testing

1. **SystemHealthIndicator Testing**
   - Circular progress calculation accuracy
   - Color transitions based on health scores
   - Animation performance validation

2. **BuildingHeatMap Testing**
   - Interactive building selection
   - Risk level color mapping accuracy
   - Tooltip functionality preservation

3. **UpcomingPPMCalendar Testing**
   - Calendar data display accuracy
   - Priority color coding validation
   - Interactive elements functionality

### Performance Testing

1. **Rendering Performance**
   - Component load time measurement
   - Animation smoothness validation
   - Memory usage optimization

2. **Theme System Performance**
   - Color resolution speed testing
   - CSS-in-JS performance validation
   - Bundle size impact assessment

## Implementation Phases

### Phase 1: Core Component Standardization
- Replace MetricCard with KpiCard components
- Standardize all Button components
- Implement consistent Card usage

### Phase 2: Theme Integration
- Integrate theme color system
- Apply consistent typography
- Implement standardized spacing

### Phase 3: Enhanced Component Updates
- Update SystemHealthIndicator styling
- Redesign BuildingHeatMap visuals
- Enhance UpcomingPPMCalendar appearance

### Phase 4: Navigation and Layout Alignment
- Align header section with other modules
- Standardize MenuBar implementation
- Optimize responsive layout patterns

### Phase 5: Testing and Refinement
- Comprehensive visual consistency testing
- Functionality preservation validation
- Performance optimization
- Cross-browser compatibility verification