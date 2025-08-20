import React, { useState, useEffect, useCallback } from 'react'
import { Database, Droplets, Download, Search, Filter } from 'lucide-react'
import { fetchWaterMeters, calculateWaterMetrics, type WaterMeter } from '../lib/waterData'

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
)

export const MainDatabaseTab = () => {
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([])
  const [filteredMeters, setFilteredMeters] = useState<WaterMeter[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [zones, setZones] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    const loadData = async () => {
      try {
        const meters = await fetchWaterMeters()
        const calculatedMetrics = calculateWaterMetrics(meters)
        
        // Extract unique values for filters
        const uniqueZones = [...new Set(meters.map(m => m.zone).filter(Boolean))]
        const uniqueTypes = [...new Set(meters.map(m => m.type).filter(Boolean))]
        
        setWaterMeters(meters)
        setFilteredMeters(meters)
        setMetrics(calculatedMetrics)
        setZones(uniqueZones)
        setTypes(uniqueTypes)
      } catch (error) {
        console.error('Error loading water data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter data based on search and filter criteria
  const applyFilters = useCallback(() => {
    setIsAnimating(true)
    
    setTimeout(() => {
      let filtered = waterMeters
      
      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(meter => 
          meter.meter_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meter.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meter.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meter.type?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Zone filter
      if (selectedZone) {
        filtered = filtered.filter(meter => meter.zone === selectedZone)
      }
      
      // Type filter
      if (selectedType) {
        filtered = filtered.filter(meter => meter.type === selectedType)
      }
      
      // Level filter
      if (selectedLevel) {
        filtered = filtered.filter(meter => meter.label === selectedLevel)
      }
      
      setFilteredMeters(filtered)
      setCurrentPage(1) // Reset to first page
      setIsAnimating(false)
    }, 200)
  }, [waterMeters, searchTerm, selectedZone, selectedType, selectedLevel])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedZone('')
    setSelectedType('')
    setSelectedLevel('')
  }

  const exportToCSV = () => {
    const headers = ['Meter Label', 'Account #', 'Zone', 'Type', 'Parent Meter', 'Level', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25', 'Total']
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
      meter.jul_25,
      meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25 + (meter.jul_25 || 0)
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'water_meters_database.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }


  const paginatedMeters = filteredMeters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredMeters.length / itemsPerPage)

  const kpis = [
    { 
      title: "TOTAL METERS", 
      value: metrics.totalMeters?.toString() || "0", 
      subtitle: "All levels", 
      icon: Database, 
      color: "bg-blue-100", 
      iconColor: "text-blue-500" 
    },
    { 
      title: "L1 METERS", 
      value: metrics.l1Count?.toString() || "0", 
      subtitle: "Main source", 
      icon: Droplets, 
      color: "bg-gray-100", 
      iconColor: "text-gray-500" 
    },
    { 
      title: "L2 METERS", 
      value: metrics.l2Count?.toString() || "0", 
      subtitle: "Zone bulk", 
      icon: Droplets, 
      color: "bg-yellow-100", 
      iconColor: "text-yellow-500" 
    },
    { 
      title: "L3 METERS", 
      value: metrics.l3Count?.toString() || "0", 
      subtitle: "Buildings/Villas", 
      icon: Droplets, 
      color: "bg-green-100", 
      iconColor: "text-green-500" 
    },
    { 
      title: "L4 METERS", 
      value: metrics.l4Count?.toString() || "0", 
      subtitle: "Apartments", 
      icon: Droplets, 
      color: "bg-purple-100", 
      iconColor: "text-purple-500" 
    },
  ]

  if (loading) {
    return <div className="text-center p-8">Loading database...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Meter Inventory</h3>
        <p className="text-sm text-gray-500 mb-4">Complete consumption data for all months.</p>
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-500 ${isAnimating ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
          {kpis.map(kpi => (
            <div key={kpi.title} className={`p-4 rounded-lg ${kpi.color} dark:bg-white/5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className={`${kpi.iconColor.replace('text-','bg-')}/20 p-2 rounded-full transition-transform duration-200 hover:scale-110`}>
                <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="font-bold text-xl text-[#4E4456] dark:text-white transition-all duration-200">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.title}</p>
                <p className="text-xs text-gray-400">{kpi.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search meters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="p-2 border rounded-lg bg-gray-50 dark:bg-white/10 transition-all duration-200"
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-2 border rounded-lg bg-gray-50 dark:bg-white/10 transition-all duration-200"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="p-2 border rounded-lg bg-gray-50 dark:bg-white/10 transition-all duration-200"
            >
              <option value="">All Levels</option>
              <option value="L1">L1 - Main Source</option>
              <option value="L2">L2 - Zone Bulk</option>
              <option value="L3">L3 - Buildings/Villas</option>
              <option value="L4">L4 - Apartments</option>
              <option value="DC">DC - Direct Connection</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Reset
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {filteredMeters.length} of {waterMeters.length} meters
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Water System Main Database</h3>
          <button 
            onClick={exportToCSV}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" /> Export to CSV
          </button>
        </div>
        
        <div className={`overflow-x-auto transition-all duration-500 ${isAnimating ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
              <tr>
                {['Meter Label', 'Account #', 'Zone', 'Type', 'Parent Meter', 'Level', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25', 'Total'].map(h => 
                  <th key={h} className="px-4 py-3">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedMeters.map((meter, index) => {
                const total = meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25 + (meter.jul_25 || 0)
                
                return (
                  <tr 
                    key={meter.id} 
                    className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <td className="px-4 py-2 font-medium">{meter.meter_label}</td>
                    <td className="px-4 py-2">{meter.account_number}</td>
                    <td className="px-4 py-2">{meter.zone}</td>
                    <td className="px-4 py-2">{meter.type}</td>
                    <td className="px-4 py-2">{meter.parent_meter}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold transition-all duration-200 hover:scale-105 ${
                        meter.label === 'L1' ? 'bg-purple-100 text-purple-800' :
                        meter.label === 'L2' ? 'bg-blue-100 text-blue-800' :
                        meter.label === 'L3' ? 'bg-green-100 text-green-800' :
                        meter.label === 'L4' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {meter.label}
                      </span>
                    </td>
                    
                    {/* Monthly data columns */}
                    {['jan_25', 'feb_25', 'mar_25', 'apr_25', 'may_25', 'jun_25', 'jul_25'].map(month => (
                      <td key={month} className="px-4 py-2">
                        {(meter[month as keyof WaterMeter] as number)?.toLocaleString() || 'N/A'}
                      </td>
                    ))}
                    
                    <td className="px-4 py-2 font-semibold">{total.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <p>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMeters.length)} of {filteredMeters.length} meters</p>
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