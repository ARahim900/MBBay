import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const TestComponent: React.FC = () => {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            App is Working!
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-green-700">React components are rendering correctly</p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-400 mr-2" />
                <p className="text-blue-700">Vite development server is running</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-yellow-700">If you see this, the basic app structure is working</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Current Status:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ React is loaded</li>
              <li>✅ Tailwind CSS is working</li>
              <li>✅ Lucide icons are working</li>
              <li>✅ Components are rendering</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => {
                console.log('Button clicked - JavaScript is working!');
                alert('JavaScript is working!');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Test JavaScript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;