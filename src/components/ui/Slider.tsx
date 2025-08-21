import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface SliderProps {
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (values: [number, number]) => void;
  className?: string;
  disabled?: boolean;
  marks?: { value: number; label: string }[];
  showLabels?: boolean;
  showTooltips?: boolean;
  color?: string;
}

export const Slider: React.FC<SliderProps> = ({
  defaultValue = [25, 75],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className = '',
  disabled = false,
  marks = [],
  showLabels = true,
  showTooltips = true,
  color = '#10b981'
}) => {
  const [values, setValues] = useState<[number, number]>(defaultValue);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [showTooltip, setShowTooltip] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLDivElement>(null);
  const maxThumbRef = useRef<HTMLDivElement>(null);

  const range = max - min;
  const minPercent = ((values[0] - min) / range) * 100;
  const maxPercent = ((values[1] - min) / range) * 100;

  const updateValues = useCallback((newValues: [number, number]) => {
    const [newMin, newMax] = newValues;
    const clampedMin = Math.max(min, Math.min(newMin, newMax - step));
    const clampedMax = Math.min(max, Math.max(newMax, newMin + step));
    
    const finalValues: [number, number] = [clampedMin, clampedMax];
    setValues(finalValues);
    
    if (onValueChange) {
      onValueChange(finalValues);
    }
  }, [min, max, step, onValueChange]);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return min;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const value = min + percent * range;
    
    return Math.round(value / step) * step;
  }, [min, range, step]);

  const handleMouseDown = useCallback((thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(thumb);
    setShowTooltip(thumb);
    
    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      
      if (thumb === 'min') {
        updateValues([newValue, values[1]]);
      } else {
        updateValues([values[0], newValue]);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      setShowTooltip(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, getValueFromPosition, updateValues, values]);

  const handleSliderClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isDragging) return;
    
    const newValue = getValueFromPosition(e.clientX);
    const [currentMin, currentMax] = values;
    
    // Determine which thumb is closer to the click position
    const minDistance = Math.abs(newValue - currentMin);
    const maxDistance = Math.abs(newValue - currentMax);
    
    if (minDistance < maxDistance) {
      updateValues([newValue, currentMax]);
    } else {
      updateValues([currentMin, newValue]);
    }
  }, [disabled, isDragging, getValueFromPosition, values, updateValues]);

  const resetValues = () => {
    updateValues(defaultValue);
  };

  // Touch/mobile support
  const handleTouchStart = useCallback((thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    if (disabled) return;
    
    setIsDragging(thumb);
    setShowTooltip(thumb);
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const newValue = getValueFromPosition(e.touches[0].clientX);
        
        if (thumb === 'min') {
          updateValues([newValue, values[1]]);
        } else {
          updateValues([values[0], newValue]);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(null);
      setShowTooltip(null);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [disabled, getValueFromPosition, updateValues, values]);

  return (
    <div className={`relative w-full py-6 ${className}`}>
      {/* Slider Track */}
      <div 
        ref={sliderRef}
        className={`relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSliderClick}
      >
        {/* Active Range */}
        <div
          className="absolute h-full rounded-full transition-all duration-200 ease-out"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
            backgroundColor: color
          }}
        />
        
        {/* Marks */}
        {marks.map((mark) => {
          const markPercent = ((mark.value - min) / range) * 100;
          return (
            <div
              key={mark.value}
              className="absolute w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 top-1/2"
              style={{ left: `${markPercent}%` }}
            />
          );
        })}

        {/* Min Thumb */}
        <div
          ref={minThumbRef}
          className={`absolute w-6 h-6 bg-white border-2 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all duration-200 ${
            isDragging === 'min' ? 'scale-110 shadow-xl' : 'hover:scale-105'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
          style={{ 
            left: `${minPercent}%`,
            borderColor: color,
            boxShadow: isDragging === 'min' ? `0 0 0 8px ${color}20` : undefined
          }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          onMouseEnter={() => !isDragging && setShowTooltip('min')}
          onMouseLeave={() => !isDragging && setShowTooltip(null)}
        />

        {/* Max Thumb */}
        <div
          ref={maxThumbRef}
          className={`absolute w-6 h-6 bg-white border-2 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all duration-200 z-10 ${
            isDragging === 'max' ? 'scale-110 shadow-xl' : 'hover:scale-105'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
          style={{ 
            left: `${maxPercent}%`,
            borderColor: color,
            boxShadow: isDragging === 'max' ? `0 0 0 8px ${color}20` : undefined
          }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          onMouseEnter={() => !isDragging && setShowTooltip('max')}
          onMouseLeave={() => !isDragging && setShowTooltip(null)}
        />

        {/* Tooltips */}
        {showTooltips && (showTooltip === 'min' || isDragging === 'min') && (
          <div
            className="absolute px-2 py-1 bg-gray-900 text-white text-sm rounded transform -translate-x-1/2 -translate-y-full -mt-2 pointer-events-none z-20"
            style={{ left: `${minPercent}%` }}
          >
            {values[0]}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        )}

        {showTooltips && (showTooltip === 'max' || isDragging === 'max') && (
          <div
            className="absolute px-2 py-1 bg-gray-900 text-white text-sm rounded transform -translate-x-1/2 -translate-y-full -mt-2 pointer-events-none z-20"
            style={{ left: `${maxPercent}%` }}
          >
            {values[1]}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>

      {/* Labels */}
      {showLabels && marks.length > 0 && (
        <div className="relative mt-2">
          {marks.map((mark) => {
            const markPercent = ((mark.value - min) / range) * 100;
            const isInRange = mark.value >= values[0] && mark.value <= values[1];
            return (
              <div
                key={mark.value}
                className={`absolute transform -translate-x-1/2 text-xs transition-colors duration-200 ${
                  isInRange ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'
                }`}
                style={{ left: `${markPercent}%` }}
              >
                {mark.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Range Display */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Range: <span className="font-semibold" style={{ color }}>{values[0]} - {values[1]}</span>
        </div>
        <button
          onClick={resetValues}
          disabled={disabled}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
};

// Range Slider specifically for date ranges
interface DateRangeSliderProps {
  onRangeChange: (startMonth: number, endMonth: number) => void;
  defaultStart?: number;
  defaultEnd?: number;
  className?: string;
}

const months = [
  { label: 'Jan-25', value: 0 },
  { label: 'Feb-25', value: 1 },
  { label: 'Mar-25', value: 2 },
  { label: 'Apr-25', value: 3 },
  { label: 'May-25', value: 4 },
  { label: 'Jun-25', value: 5 },
  { label: 'Jul-25', value: 6 }
];

export const ModernDateRangeSlider: React.FC<DateRangeSliderProps> = ({
  onRangeChange,
  defaultStart = 0,
  defaultEnd = 6,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRangeChange = useCallback((values: [number, number]) => {
    setIsAnimating(true);
    
    const timeoutId = setTimeout(() => {
      onRangeChange(values[0], values[1]);
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [onRangeChange]);

  return (
    <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md border border-gray-200/80 dark:border-white/10 p-6 transition-all duration-300 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range Filter
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select the time period for analysis
        </p>
      </div>

      <Slider
        defaultValue={[defaultStart, defaultEnd]}
        min={0}
        max={6}
        step={1}
        onValueChange={handleRangeChange}
        marks={months}
        showLabels={true}
        showTooltips={true}
        color="#10b981"
        className="mb-2"
      />

      {/* Loading indicator */}
      {isAnimating && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            Updating data...
          </div>
        </div>
      )}
    </div>
  );
};