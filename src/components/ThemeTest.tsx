import React from 'react';
import { theme } from '../lib/theme';

export const ThemeTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background }}>
      <h1 style={{ 
        fontSize: theme.typography.titleSize, 
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily,
        marginBottom: '20px'
      }}>
        Theme Configuration Test
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '60px', 
            backgroundColor: theme.colors.primary,
            borderRadius: '8px',
            marginBottom: '5px'
          }} />
          <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
            Primary<br/>{theme.colors.primary}
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '60px', 
            backgroundColor: theme.colors.secondary,
            borderRadius: '8px',
            marginBottom: '5px'
          }} />
          <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
            Secondary<br/>{theme.colors.secondary}
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '60px', 
            backgroundColor: theme.colors.accent,
            borderRadius: '8px',
            marginBottom: '5px'
          }} />
          <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
            Accent<br/>{theme.colors.accent}
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '60px', 
            backgroundColor: theme.colors.gridLines,
            borderRadius: '8px',
            marginBottom: '5px',
            border: `1px solid ${theme.colors.textSecondary}`
          }} />
          <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
            Grid Lines<br/>{theme.colors.gridLines}
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: theme.typography.titleSize, color: theme.colors.textPrimary, marginBottom: '10px' }}>
          Typography Sizes
        </h2>
        <p style={{ fontSize: theme.typography.titleSize, color: theme.colors.textPrimary }}>
          Title: {theme.typography.titleSize}
        </p>
        <p style={{ fontSize: theme.typography.labelSize, color: theme.colors.textSecondary }}>
          Label: {theme.typography.labelSize}
        </p>
        <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
          Tooltip: {theme.typography.tooltipSize}
        </p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: theme.typography.titleSize, color: theme.colors.textPrimary, marginBottom: '10px' }}>
          Chart Configuration
        </h2>
        <p style={{ fontSize: theme.typography.labelSize, color: theme.colors.textSecondary }}>
          Line Width: {theme.charts.line.strokeWidth}px<br/>
          Dot Size: {theme.charts.line.dotSize}px<br/>
          Bar Radius: {theme.charts.bar.borderRadius}px<br/>
          Donut Inner Radius: {theme.charts.pie.innerRadiusRatio * 100}%
        </p>
      </div>
    </div>
  );
};

export default ThemeTest;