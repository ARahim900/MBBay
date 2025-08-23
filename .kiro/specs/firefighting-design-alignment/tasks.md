# Implementation Plan

- [x] 1. Update FirefightingDashboard main component structure and imports





  - Replace custom styling with theme imports and standardized components
  - Update header section to match EnhancedWaterModule pattern
  - Fix Button component variant issues (replace "default" with "primary")
  - Remove unused imports (Database, theme)
  - _Requirements: 1.3, 2.1, 4.1, 4.4_

- [x] 2. Standardize KPI metrics section with KpiCard components





  - Replace custom metric display with KpiCard components
  - Apply consistent color mapping (green, orange, pink, blue)
  - Implement proper trend indicators and subtitles
  - Ensure all KPI data flows are preserved
  - _Requirements: 1.2, 2.2, 5.4_

- [x] 3. Update SystemHealthIndicator component styling





  - Integrate theme colors for health status indicators
  - Apply consistent typography from theme configuration
  - Maintain circular progress functionality while using theme colors
  - Update animations to use theme duration and easing values
  - _Requirements: 1.1, 3.1, 3.4, 5.1_

- [x] 4. Redesign BuildingHeatMap component visuals





  - Replace custom colors with theme status colors for risk levels
  - Standardize legend styling to match application patterns
  - Apply consistent hover effects and transitions
  - Preserve all interactive functionality and building selection
  - _Requirements: 1.1, 3.1, 5.2_

- [x] 5. Enhance UpcomingPPMCalendar component design





  - Use standard Card component as container
  - Apply theme colors for priority indicators (high: red, medium: yellow, low: green)
  - Standardize button styling and typography
  - Implement consistent spacing patterns from theme
  - _Requirements: 1.1, 2.1, 2.3, 5.3_

- [x] 6. Replace MetricCard with standardized components





  - Remove custom MetricCard component file
  - Update all MetricCard usages to use KpiCard instead
  - Ensure all metric data and functionality is preserved
  - Apply consistent color schemes and styling
  - _Requirements: 2.2, 5.4_

- [ ] 7. Standardize navigation MenuBar implementation
  - Update menu items to use consistent gradient and iconColor patterns
  - Ensure MenuBar component usage matches other enhanced modules
  - Apply proper spacing and layout alignment
  - Verify all navigation functionality is preserved
  - _Requirements: 1.4, 4.2_

- [x] 8. Update alert and status indicator color coding





  - Replace custom alert colors with theme status colors
  - Implement consistent priority color mapping across all components
  - Update critical, warning, success, and info indicators
  - Ensure all alert functionality and real-time updates are preserved
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Apply consistent Card component usage throughout





  - Replace any custom card implementations with standard Card component
  - Ensure consistent padding, border radius, and shadow styles
  - Apply proper hover effects and animations
  - Maintain all existing content and functionality
  - _Requirements: 2.1, 3.2_

- [x] 10. Implement comprehensive theme integration





  - Add theme imports to all firefighting components
  - Replace hardcoded colors with theme color references
  - Apply theme typography, spacing, and border radius values
  - Ensure proper fallback handling for missing theme values
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 11. Update responsive layout and grid patterns





  - Align grid layouts with other enhanced modules
  - Apply consistent spacing patterns from theme configuration
  - Ensure proper responsive behavior across all screen sizes
  - Maintain optimal component arrangement and visual hierarchy
  - _Requirements: 2.4_

- [x] 12. Perform visual consistency validation and testing





  - Compare firefighting dashboard with other enhanced modules
  - Verify color palette consistency across all components
  - Test typography alignment and spacing patterns
  - Validate hover effects and animation consistency
  - _Requirements: 1.1, 1.2, 1.3, 1.4_