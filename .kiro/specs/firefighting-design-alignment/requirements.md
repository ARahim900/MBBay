# Requirements Document

## Introduction

This feature focuses on revising the firefighting and alarm section design to align with the existing application's visual style. The goal is to maintain consistent coloring, typography, and component styling across all sections to create a unified user interface. The revision will apply the same design patterns used in other sections while preserving the firefighting and alarm system's functionality, ensuring all UI elements match the application's established design system for a cohesive experience.

## Requirements

### Requirement 1

**User Story:** As a user, I want the firefighting dashboard to visually match the rest of the application, so that I have a consistent and professional experience across all modules.

#### Acceptance Criteria

1. WHEN viewing the firefighting dashboard THEN the color scheme SHALL match the application's theme colors (primary: #2D9CDB, secondary: #FF5B5B, accent: #F7C604)
2. WHEN viewing any firefighting component THEN the typography SHALL use the Inter font family with consistent sizing (title: 1.25rem, label: 0.875rem, tooltip: 0.75rem)
3. WHEN interacting with firefighting UI elements THEN they SHALL use the same Card, KpiCard, and Button components as other modules
4. WHEN viewing the firefighting navigation THEN it SHALL use the same MenuBar component with consistent gradient backgrounds and iconColor patterns

### Requirement 2

**User Story:** As a user, I want the firefighting components to follow the same visual hierarchy and spacing patterns, so that the interface feels familiar and intuitive.

#### Acceptance Criteria

1. WHEN viewing firefighting cards THEN they SHALL use the standard Card component with consistent padding, border radius, and shadow styles
2. WHEN viewing KPI metrics THEN they SHALL use the KpiCard component with the established color mapping (green, blue, orange, pink, etc.)
3. WHEN viewing buttons THEN they SHALL use the Button component with consistent variants (primary, secondary, outline, ghost, danger)
4. WHEN viewing the dashboard layout THEN it SHALL follow the same grid patterns and spacing as other enhanced modules

### Requirement 3

**User Story:** As a developer, I want the firefighting components to use the centralized theme configuration, so that design changes can be managed consistently across the application.

#### Acceptance Criteria

1. WHEN implementing firefighting components THEN they SHALL import and use colors from the theme.ts configuration
2. WHEN styling firefighting elements THEN they SHALL use the theme's typography, spacing, and borderRadius values
3. WHEN creating new firefighting components THEN they SHALL follow the same component structure and prop patterns as existing UI components
4. WHEN applying hover effects and animations THEN they SHALL use the theme's animation duration and easing values

### Requirement 4

**User Story:** As a user, I want the firefighting dashboard header and navigation to match other module headers, so that the interface maintains visual consistency.

#### Acceptance Criteria

1. WHEN viewing the firefighting dashboard header THEN it SHALL follow the same layout pattern as EnhancedWaterModule and other enhanced modules
2. WHEN viewing the firefighting navigation menu THEN it SHALL use the MenuBar component with consistent gradient and iconColor configurations
3. WHEN viewing the firefighting page title THEN it SHALL use the same typography styles and color (#4E4456 dark:text-white)
4. WHEN viewing action buttons in the header THEN they SHALL use the standard Button component with consistent styling

### Requirement 5

**User Story:** As a user, I want the firefighting-specific components to maintain their functionality while adopting the application's visual style, so that I don't lose any features during the design update.

#### Acceptance Criteria

1. WHEN using the SystemHealthIndicator THEN it SHALL maintain its circular progress functionality while using theme colors
2. WHEN viewing the BuildingHeatMap THEN it SHALL preserve its interactive features while adopting consistent color schemes
3. WHEN using the UpcomingPPMCalendar THEN it SHALL keep its scheduling functionality while using standard Card and color patterns
4. WHEN viewing the MetricCard components THEN they SHALL be replaced with the standard KpiCard component while preserving all data display functionality

### Requirement 6

**User Story:** As a user, I want the firefighting alerts and status indicators to use consistent color coding, so that I can quickly understand system states across all modules.

#### Acceptance Criteria

1. WHEN viewing critical alerts THEN they SHALL use the theme's status.error color (#ef4444)
2. WHEN viewing warning indicators THEN they SHALL use the theme's status.warning color (#f59e0b)
3. WHEN viewing success states THEN they SHALL use the theme's status.success color (#10b981)
4. WHEN viewing informational elements THEN they SHALL use the theme's status.info color (#3b82f6)
5. WHEN viewing priority indicators THEN they SHALL use the established color mapping (high: red, medium: yellow, low: green)