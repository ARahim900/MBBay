import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface DateRangeSliderProps {
  onRangeChange: (startMonth: number, endMonth: number) => void
  defaultStart?: number
  defaultEnd?: number
  className?: string
}

const months = [
  { label: 'Jan-25', value: 0 },
  { label: 'Feb-25', value: 1 },
  { label: 'Mar-25', value: 2 },
  { label: 'Apr-25', value: 3 },
  { label: 'May-25', value: 4 },
  { label: 'Jun-25', value: 5 },
  { label: 'Jul-25', value: 6 }
]

export const DateRangeSlider: React.FC<DateRangeSliderProps> = ({
  onRangeChange,
  defaultStart = 0,
  defaultEnd = 6,
  className = ''
}) => {
  const [startMonth, setStartMonth] = useState(defaultStart)
  const [endMonth, setEndMonth] = useState(defaultEnd)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onRangeChange(startMonth, endMonth)
      setIsAnimating(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [startMonth, endMonth, onRangeChange])

  const handleStartChange = (value: number) => {
    setIsAnimating(true)
    setStartMonth(Math.min(value, endMonth))
  }

  const handleEndChange = (value: number) => {
    setIsAnimating(true)
    setEndMonth(Math.max(value, startMonth))
  }

  const resetRange = () => {
    setIsAnimating(true)
    setStartMonth(0)
    setEndMonth(6)
  }

  return (
    <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md border border-gray-200/80 dark:border-white/10 p-4 transition-all duration-300 ${className}`}>
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">Date Range:</span>
          <div className="flex items-center gap-2">
            <select
              value={startMonth}
              onChange={(e) => handleStartChange(parseInt(e.target.value))}
              className="p-2 border rounded-md w-24 text-center bg-gray-50 dark:bg-white/10 transition-all duration-200"
            >
              {months.slice(0, endMonth + 1).map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">to</span>
            <select
              value={endMonth}
              onChange={(e) => handleEndChange(parseInt(e.target.value))}
              className="p-2 border rounded-md w-24 text-center bg-gray-50 dark:bg-white/10 transition-all duration-200"
            >
              {months.slice(startMonth).map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Range Slider */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="relative flex-1">
            <input
              type="range"
              min={0}
              max={6}
              value={startMonth}
              onChange={(e) => handleStartChange(parseInt(e.target.value))}
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-start"
              style={{ zIndex: 1 }}
            />
            <input
              type="range"
              min={0}
              max={6}
              value={endMonth}
              onChange={(e) => handleEndChange(parseInt(e.target.value))}
              className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-end"
              style={{ zIndex: 2 }}
            />
            <div className="relative w-full h-2 bg-gray-200 rounded-lg">
              <div
                className="absolute h-full bg-green-500 rounded-lg transition-all duration-300"
                style={{
                  left: `${(startMonth / 6) * 100}%`,
                  width: `${((endMonth - startMonth) / 6) * 100}%`
                }}
              />
            </div>
          </div>
          
          <button
            onClick={resetRange}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
            Reset
          </button>
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        {months.map((month, index) => (
          <div
            key={month.value}
            className={`transition-all duration-300 ${
              index >= startMonth && index <= endMonth
                ? 'text-green-600 font-semibold'
                : 'text-gray-400'
            }`}
          >
            {month.label}
          </div>
        ))}
      </div>
    </div>
  )
}