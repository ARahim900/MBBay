import { type WaterMeter } from './supabase'
import { monthMapping, calculateTotalForMonths, filterByDateRange } from './waterData'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  summary: {
    totalMeters: number
    validatedMeters: number
    skippedMeters: number
    totalConsumption: number
    averageConsumption: number
  }
}

interface TypeConsumptionData {
  type: string
  monthlyData: { [key: string]: number }
  total: number
  meterCount: number
  percentageOfTotal: number
  percentageOfL1: number
}

// Primary validation function for consumption data
export const validateConsumptionData = (
  meters: WaterMeter[],
  selectedType: string,
  startMonth: number,
  endMonth: number
): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  let validatedMeters = 0
  let skippedMeters = 0

  // Get selected months for validation
  const { selectedMonths } = filterByDateRange(meters, startMonth, endMonth)
  
  // Improved type filtering logic
  console.log('=== DATA VALIDATION DEBUG ===')
  console.log('Total meters received:', meters.length)
  console.log('Selected type:', selectedType)
  
  const typeMeters = meters.filter(m => {
    if (!m.type) return false
    
    const meterType = m.type.toLowerCase()
    const searchType = selectedType.toLowerCase()
    
    // Handle different possible type names
    if (searchType === 'irrigation') {
      const matches = meterType.includes('irrigation') || 
                     meterType.includes('irrigat') || 
                     meterType.includes('garden') ||
                     meterType.includes('landscape')
      if (matches) {
        console.log('Found irrigation meter:', {
          label: m.meter_label,
          type: m.type,
          jan25: m.jan_25,
          feb25: m.feb_25
        })
      }
      return matches
    }
    
    if (searchType === 'commercial') {
      return meterType.includes('commercial') || 
             meterType.includes('business') ||
             meterType.includes('office')
    }
    
    if (searchType === 'residential') {
      return meterType.includes('residential') || 
             meterType.includes('house') ||
             meterType.includes('home') ||
             meterType.includes('villa')
    }
    
    if (searchType === 'common') {
      return meterType.includes('common') || 
             meterType.includes('shared') ||
             meterType.includes('community')
    }
    
    // Fallback to partial match
    return meterType.includes(searchType)
  })

  if (typeMeters.length === 0) {
    errors.push(`No meters found for type: ${selectedType}`)
    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        totalMeters: 0,
        validatedMeters: 0,
        skippedMeters: meters.length,
        totalConsumption: 0,
        averageConsumption: 0
      }
    }
  }

  // Validate each meter's data
  let totalConsumption = 0
  typeMeters.forEach(meter => {
    let meterIsValid = true
    let meterTotal = 0

    // Check for null or undefined values
    selectedMonths.forEach(monthKey => {
      const value = meter[monthKey]
      
      if (value === null || value === undefined) {
        warnings.push(`Meter ${meter.meter_label} has no data for ${monthKey}`)
      } else if (typeof value !== 'number') {
        errors.push(`Meter ${meter.meter_label} has invalid data type for ${monthKey}: ${typeof value}`)
        meterIsValid = false
      } else if (value < 0) {
        errors.push(`Meter ${meter.meter_label} has negative value for ${monthKey}: ${value}`)
        meterIsValid = false
      } else {
        meterTotal += value
      }
    })

    // Check for unusually high consumption (potential data error)
    if (meterTotal > 100000) {
      warnings.push(`Meter ${meter.meter_label} has unusually high consumption: ${meterTotal} m³`)
    }

    // Check for zero consumption across all months
    if (meterTotal === 0) {
      warnings.push(`Meter ${meter.meter_label} has zero consumption for selected period`)
    }

    if (meterIsValid) {
      validatedMeters++
      totalConsumption += meterTotal
    } else {
      skippedMeters++
    }
  })

  const averageConsumption = validatedMeters > 0 ? totalConsumption / validatedMeters : 0

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalMeters: typeMeters.length,
      validatedMeters,
      skippedMeters,
      totalConsumption,
      averageConsumption
    }
  }
}

// Secondary verification function - cross-checks calculations
export const verifyTypeCalculations = (
  meters: WaterMeter[],
  selectedType: string,
  startMonth: number,
  endMonth: number
): TypeConsumptionData => {
  const { selectedMonths, monthLabels } = filterByDateRange(meters, startMonth, endMonth)
  
  // Filter meters by type (using improved filtering logic)
  const searchType = selectedType.toLowerCase()
  const typeMeters = meters.filter(m => {
    if (!m.type) return false
    
    const meterType = m.type.toLowerCase()
    
    // Handle different possible type names
    if (searchType === 'irrigation') {
      return meterType.includes('irrigation') || 
             meterType.includes('irrigat') || 
             meterType.includes('garden') ||
             meterType.includes('landscape')
    }
    
    if (searchType === 'commercial') {
      return meterType.includes('commercial') || 
             meterType.includes('business') ||
             meterType.includes('office')
    }
    
    if (searchType === 'residential') {
      return meterType.includes('residential') || 
             meterType.includes('house') ||
             meterType.includes('home') ||
             meterType.includes('villa')
    }
    
    if (searchType === 'common') {
      return meterType.includes('common') || 
             meterType.includes('shared') ||
             meterType.includes('community')
    }
    
    // Fallback to partial match
    return meterType.includes(searchType)
  })
  
  console.log(`verifyTypeCalculations: Found ${typeMeters.length} meters for type: ${selectedType}`)

  // Calculate monthly consumption
  const monthlyData: { [key: string]: number } = {}
  let totalTypeConsumption = 0

  selectedMonths.forEach((monthKey, index) => {
    const monthLabel = monthLabels[index].toLowerCase().replace('-', '')
    const monthTotal = typeMeters.reduce((sum, meter) => {
      const value = meter[monthKey]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
    monthlyData[monthLabel] = monthTotal
    totalTypeConsumption += monthTotal
  })

  // Calculate L1 total for percentage
  const l1Meters = meters.filter(m => m.label === 'L1')
  const l1Total = l1Meters.reduce((sum, meter) => 
    sum + calculateTotalForMonths(meter, selectedMonths), 0
  )

  // Calculate total consumption across all types
  const totalAllTypes = meters.reduce((sum, meter) => 
    sum + calculateTotalForMonths(meter, selectedMonths), 0
  )

  return {
    type: selectedType,
    monthlyData,
    total: totalTypeConsumption,
    meterCount: typeMeters.length,
    percentageOfTotal: totalAllTypes > 0 ? (totalTypeConsumption / totalAllTypes) * 100 : 0,
    percentageOfL1: l1Total > 0 ? (totalTypeConsumption / l1Total) * 100 : 0
  }
}

// Double verification process
export const doubleVerifyConsumptionData = (
  meters: WaterMeter[],
  selectedType: string,
  startMonth: number,
  endMonth: number
): {
  validation: ValidationResult
  verification: TypeConsumptionData
  discrepancies: string[]
} => {
  // First pass: Validate data integrity
  const validation = validateConsumptionData(meters, selectedType, startMonth, endMonth)
  
  // Second pass: Verify calculations
  const verification = verifyTypeCalculations(meters, selectedType, startMonth, endMonth)
  
  const discrepancies: string[] = []
  
  // Cross-check totals
  if (Math.abs(validation.summary.totalConsumption - verification.total) > 0.01) {
    discrepancies.push(
      `Total consumption mismatch: Validation=${validation.summary.totalConsumption}, Verification=${verification.total}`
    )
  }
  
  // Check meter counts
  if (validation.summary.totalMeters !== verification.meterCount) {
    discrepancies.push(
      `Meter count mismatch: Validation=${validation.summary.totalMeters}, Verification=${verification.meterCount}`
    )
  }
  
  // Validate percentage calculations
  if (verification.percentageOfL1 < 0 || verification.percentageOfL1 > 100) {
    discrepancies.push(`Invalid L1 percentage: ${verification.percentageOfL1}%`)
  }
  
  if (verification.percentageOfTotal < 0 || verification.percentageOfTotal > 100) {
    discrepancies.push(`Invalid total percentage: ${verification.percentageOfTotal}%`)
  }

  return {
    validation,
    verification,
    discrepancies
  }
}

// Validate relationships between different meter levels
export const validateMeterRelationships = (meters: WaterMeter[]): {
  isValid: boolean
  relationships: {
    l1ToL2: { expected: number, actual: number, difference: number }
    l2ToL3: { expected: number, actual: number, difference: number }
    l3ToL4: { expected: number, actual: number, difference: number }
  }
  errors: string[]
} => {
  const errors: string[] = []
  
  // Calculate totals for each level
  const l1Total = meters.filter(m => m.label === 'L1').reduce((sum, m) => 
    sum + (m.jan_25 + m.feb_25 + m.mar_25 + m.apr_25 + m.may_25 + m.jun_25 + (m.jul_25 || 0)), 0
  )
  
  const l2Total = meters.filter(m => m.label === 'L2').reduce((sum, m) => 
    sum + (m.jan_25 + m.feb_25 + m.mar_25 + m.apr_25 + m.may_25 + m.jun_25 + (m.jul_25 || 0)), 0
  )
  
  const l3Total = meters.filter(m => m.label === 'L3').reduce((sum, m) => 
    sum + (m.jan_25 + m.feb_25 + m.mar_25 + m.apr_25 + m.may_25 + m.jun_25 + (m.jul_25 || 0)), 0
  )
  
  const l4Total = meters.filter(m => m.label === 'L4').reduce((sum, m) => 
    sum + (m.jan_25 + m.feb_25 + m.mar_25 + m.apr_25 + m.may_25 + m.jun_25 + (m.jul_25 || 0)), 0
  )

  // Validate hierarchical relationships
  const relationships = {
    l1ToL2: {
      expected: l1Total,
      actual: l2Total,
      difference: l1Total - l2Total
    },
    l2ToL3: {
      expected: l2Total,
      actual: l3Total,
      difference: l2Total - l3Total
    },
    l3ToL4: {
      expected: l3Total,
      actual: l4Total,
      difference: l3Total - l4Total
    }
  }

  // Check for logical inconsistencies
  if (l2Total > l1Total) {
    errors.push(`L2 total (${l2Total}) exceeds L1 total (${l1Total}) - impossible without external source`)
  }

  if (l3Total > l2Total * 1.1) { // Allow 10% margin for direct connections
    errors.push(`L3 total (${l3Total}) significantly exceeds L2 total (${l2Total})`)
  }

  if (l4Total > l3Total * 1.1) { // Allow 10% margin
    errors.push(`L4 total (${l4Total}) significantly exceeds L3 total (${l3Total})`)
  }

  // Check for reasonable water loss percentages
  const l1ToL2Loss = relationships.l1ToL2.difference / l1Total * 100
  if (l1ToL2Loss > 30) {
    errors.push(`Excessive water loss from L1 to L2: ${l1ToL2Loss.toFixed(1)}%`)
  }

  return {
    isValid: errors.length === 0,
    relationships,
    errors
  }
}

// Comprehensive data integrity check
export const performComprehensiveValidation = (
  meters: WaterMeter[],
  selectedType: string,
  startMonth: number,
  endMonth: number
): {
  isValid: boolean
  validationResults: ValidationResult
  verificationData: TypeConsumptionData
  relationshipCheck: ReturnType<typeof validateMeterRelationships>
  discrepancies: string[]
  recommendations: string[]
} => {
  // Run double verification
  const { validation, verification, discrepancies } = doubleVerifyConsumptionData(
    meters, selectedType, startMonth, endMonth
  )
  
  // Check meter relationships
  const relationshipCheck = validateMeterRelationships(meters)
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (validation.warnings.length > 5) {
    recommendations.push('Consider reviewing meters with missing or zero data')
  }
  
  if (verification.percentageOfL1 > 60) {
    recommendations.push(`${selectedType} consumption is high (${verification.percentageOfL1.toFixed(1)}% of L1)`)
  }
  
  if (relationshipCheck.relationships.l1ToL2.difference > 10000) {
    recommendations.push('Investigate high water loss between L1 and L2 meters')
  }
  
  const isValid = validation.isValid && 
                  discrepancies.length === 0 && 
                  relationshipCheck.isValid

  return {
    isValid,
    validationResults: validation,
    verificationData: verification,
    relationshipCheck,
    discrepancies,
    recommendations
  }
}