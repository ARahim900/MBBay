import React, { useState } from 'react';
import { Slider } from './ui/Slider';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md border border-gray-200/80 dark:border-white/10 p-6 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const SliderDemo = () => {
  const [value1, setValue1] = useState<[number, number]>([25, 75]);
  const [value2, setValue2] = useState<[number, number]>([0, 6]);
  const [value3, setValue3] = useState<[number, number]>([20, 80]);

  const months = [
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Apr', value: 3 },
    { label: 'May', value: 4 },
    { label: 'Jun', value: 5 },
    { label: 'Jul', value: 6 }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#4E4456] dark:text-white mb-2">Modern Range Slider Examples</h2>
        <p className="text-gray-600 dark:text-gray-300">Enhanced range sliders similar to <code className="bg-gray-100 px-2 py-1 rounded">&lt;Slider defaultValue={[25, 75]} /&gt;</code></p>
      </div>

      {/* Basic Example - Similar to your request */}
      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Basic Range Slider</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Similar to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">&lt;Slider defaultValue={[25, 75]} /&gt;</code>
        </p>
        
        <Slider 
          defaultValue={[25, 75]} 
          onValueChange={setValue1}
          color="#10b981"
          showTooltips={true}
        />
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium">Current Values: [{value1[0]}, {value1[1]}]</p>
        </div>
      </Card>

      {/* Date Range Example */}
      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Date Range Slider</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Range slider with month labels for date filtering (used in Water System)
        </p>
        
        <Slider 
          defaultValue={[0, 6]} 
          min={0}
          max={6}
          step={1}
          marks={months}
          onValueChange={setValue2}
          color="#3b82f6"
          showLabels={true}
          showTooltips={true}
        />
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium">Selected Period: {months[value2[0]]?.label} to {months[value2[1]]?.label}</p>
        </div>
      </Card>

      {/* Percentage Range Example */}
      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Percentage Range Slider</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ideal for filtering data by percentage ranges or efficiency levels
        </p>
        
        <Slider 
          defaultValue={[20, 80]} 
          min={0}
          max={100}
          step={5}
          marks={[
            { label: '0%', value: 0 },
            { label: '25%', value: 25 },
            { label: '50%', value: 50 },
            { label: '75%', value: 75 },
            { label: '100%', value: 100 }
          ]}
          onValueChange={setValue3}
          color="#f59e0b"
          showLabels={true}
          showTooltips={true}
        />
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium">Efficiency Range: {value3[0]}% - {value3[1]}%</p>
        </div>
      </Card>

      {/* Features Overview */}
      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Enhanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Interactive Elements</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Smooth hover animations</li>
              <li>• Touch/mobile support</li>
              <li>• Visual feedback on interaction</li>
              <li>• Tooltip display on hover/drag</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Customization</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Custom colors and themes</li>
              <li>• Configurable marks and labels</li>
              <li>• Min/max/step values</li>
              <li>• Disabled state support</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};