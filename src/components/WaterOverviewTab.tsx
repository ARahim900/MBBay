import React, { useState, useEffect } from 'react'
import { Droplets, ChevronsRight, Home, User, Download } from 'lucide-react'
import { fetchWaterMeters, calculateWaterMetrics, type WaterMeter } from '../lib/waterData'

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
)

export const WaterOverviewTab = () => {
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const loadData = async () => {
      try {
        const meters = await fetchWaterMeters()
        const calculatedMetrics = calculateWaterMetrics(meters)
        setWaterMeters(meters)
        setMetrics(calculatedMetrics)
      } catch (error) {
        console.error('Error loading water data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const exportToCSV = () => {
    const headers = ['Meter Label', 'Account #', 'Zone', 'Type', 'Parent Meter', 'Level', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Total']
    const csvData = waterMeters.map(meter => [
      meter.meter_label,
      meter.account_number,
      meter.zone,
      meter.type,
      meter.parent_meter,
      meter.label,
      meter.jan_25,
      meter.feb_25,
      meter.mar_25,
      meter.apr_25,
      meter.may_25,
      meter.jun_25,
      meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'water_meters_overview.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const paginatedMeters = waterMeters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(waterMeters.length / itemsPerPage)

  if (loading) {
    return <div className="text-center p-8">Loading water meter data...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Meter Inventory</h3>
          <p className="text-sm text-gray-500">Total: {metrics.totalMeters} meters</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-blue-100 dark:bg-white/5 flex items-center gap-4">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-xl text-[#4E4456] dark:text-white">{metrics.totalMeters}</p>
              <p className="text-xs text-gray-500">TOTAL METERS</p>
              <p className="text-xs text-gray-400">All levels</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center gap-4">
            <div className="bg-gray-500/20 p-2 rounded-full">
              <Droplets className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-xl text-[#4E4456] dark:text-white">{metrics.l1Count}</p>
              <p className="text-xs text-gray-500">L1 METERS</p>
              <p className="text-xs text-gray-400">Main source</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-yellow-100 dark:bg-white/5 flex items-center gap-4">
            <div className="bg-yellow-500/20 p-2 rounded-full">
              <Droplets className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-bold text-xl text-[#4E4456] dark:text-white">{metrics.l2Count}</p>
              <p className="text-xs text-gray-500">L2 METERS</p>
              <p className="text-xs text-gray-400">Zone bulk</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-100 dark:bg-white/5 flex items-center gap-4">
            <div className="bg-green-500/20 p-2 rounded-full">
              <Droplets className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-xl text-[#4E4456] dark:text-white">{metrics.l3Count}</p>
              <p className="text-xs text-gray-500">L3 METERS</p>
              <p className="text-xs text-gray-400">Buildings/Villas</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-100 dark:bg-white/5 flex items-center gap-4">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <Droplets className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="font-bold text-xl text-[#4E4456] dark:text-white">{metrics.l4Count}</p>
              <p className="text-xs text-gray-500">L4 METERS</p>
              <p className="text-xs text-gray-400">Apartments</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Water System Database</h3>
          <button 
            onClick={exportToCSV}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Export to CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
              <tr>
                {['Meter Label', 'Account #', 'Zone', 'Type', 'Parent Meter', 'Level', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Total'].map(h => 
                  <th key={h} className="px-4 py-3">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedMeters.map((meter) => {
                const total = meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25
                return (
                  <tr key={meter.id} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-2 font-medium">{meter.meter_label}</td>
                    <td className="px-4 py-2">{meter.account_number}</td>
                    <td className="px-4 py-2">{meter.zone}</td>
                    <td className="px-4 py-2">{meter.type}</td>
                    <td className="px-4 py-2">{meter.parent_meter}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        meter.label === 'L1' ? 'bg-purple-100 text-purple-800' :
                        meter.label === 'L2' ? 'bg-blue-100 text-blue-800' :
                        meter.label === 'L3' ? 'bg-green-100 text-green-800' :
                        meter.label === 'L4' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {meter.label}
                      </span>
                    </td>
                    <td className="px-4 py-2">{meter.jan_25?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{meter.feb_25?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{meter.mar_25?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{meter.apr_25?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{meter.may_25?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2">{meter.jun_25?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 font-semibold">{total.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <p>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, waterMeters.length)} of {waterMeters.length} meters</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}