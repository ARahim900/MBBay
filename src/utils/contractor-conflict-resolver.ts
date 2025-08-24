import type { Contractor } from '../types/contractor';

export interface ConflictDetails {
  field: keyof Contractor;
  serverValue: any;
  clientValue: any;
  hasConflict: boolean;
}

export interface ConflictResolutionResult {
  resolvedContractor: Contractor;
  conflicts: ConflictDetails[];
  strategy: string;
  timestamp: string;
}

/**
 * ContractorConflictResolver - Utility class for handling data conflicts
 * Provides various strategies for resolving concurrent edit conflicts
 */
export class ContractorConflictResolver {
  
  /**
   * Detect conflicts between server and client data
   */
  static detectConflicts(serverData: Contractor, clientData: Contractor): ConflictDetails[] {
    const conflicts: ConflictDetails[] = [];
    
    // Fields to check for conflicts (excluding system fields)
    const fieldsToCheck: (keyof Contractor)[] = [
      'contractor_name',
      'service_provided',
      'status',
      'contract_type',
      'start_date',
      'end_date',
      'contract_monthly_amount',
      'contract_yearly_amount',
      'notes'
    ];

    fieldsToCheck.forEach(field => {
      const serverValue = serverData[field];
      const clientValue = clientData[field];
      const hasConflict = serverValue !== clientValue;

      conflicts.push({
        field,
        serverValue,
        clientValue,
        hasConflict
      });
    });

    return conflicts;
  }

  /**
   * Server-wins strategy: Always use server data
   */
  static resolveServerWins(
    serverData: Contractor, 
    clientData: Contractor
  ): ConflictResolutionResult {
    const conflicts = this.detectConflicts(serverData, clientData);
    
    return {
      resolvedContractor: serverData,
      conflicts,
      strategy: 'server-wins',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Client-wins strategy: Always use client data (with server metadata)
   */
  static resolveClientWins(
    serverData: Contractor, 
    clientData: Contractor
  ): ConflictResolutionResult {
    const conflicts = this.detectConflicts(serverData, clientData);
    
    // Use client data but preserve server metadata
    const resolvedContractor: Contractor = {
      ...clientData,
      id: serverData.id,
      created_at: serverData.created_at,
      updated_at: serverData.updated_at
    };

    return {
      resolvedContractor,
      conflicts,
      strategy: 'client-wins',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Smart merge strategy: Merge based on field importance and recency
   */
  static resolveSmartMerge(
    serverData: Contractor, 
    clientData: Contractor
  ): ConflictResolutionResult {
    const conflicts = this.detectConflicts(serverData, clientData);
    
    // Start with server data as base
    const resolvedContractor: Contractor = { ...serverData };

    // Apply smart merge rules
    conflicts.forEach(conflict => {
      if (!conflict.hasConflict) return;

      switch (conflict.field) {
        // Critical fields: prefer server data for consistency
        case 'status':
        case 'contract_type':
          // Keep server value
          break;

        // Financial fields: prefer client data if it's more recent
        case 'contract_monthly_amount':
        case 'contract_yearly_amount':
          // Use client value if it's different (assuming client has more recent info)
          if (conflict.clientValue !== null && conflict.clientValue !== undefined) {
            resolvedContractor[conflict.field] = conflict.clientValue;
          }
          break;

        // Text fields: prefer client data (user might have added more info)
        case 'contractor_name':
        case 'service_provided':
        case 'notes':
          // Use client value if it's longer or more detailed
          const serverText = String(conflict.serverValue || '');
          const clientText = String(conflict.clientValue || '');
          
          if (clientText.length > serverText.length) {
            resolvedContractor[conflict.field] = conflict.clientValue;
          }
          break;

        // Date fields: use more recent date
        case 'start_date':
        case 'end_date':
          const serverDate = new Date(conflict.serverValue);
          const clientDate = new Date(conflict.clientValue);
          
          // Use the date that seems more reasonable (not too far in past/future)
          const now = new Date();
          const serverDiff = Math.abs(now.getTime() - serverDate.getTime());
          const clientDiff = Math.abs(now.getTime() - clientDate.getTime());
          
          if (clientDiff < serverDiff) {
            resolvedContractor[conflict.field] = conflict.clientValue;
          }
          break;

        default:
          // For unknown fields, prefer server data
          break;
      }
    });

    return {
      resolvedContractor,
      conflicts,
      strategy: 'smart-merge',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Field-priority strategy: Resolve based on field importance
   */
  static resolveFieldPriority(
    serverData: Contractor, 
    clientData: Contractor,
    fieldPriorities: Record<keyof Contractor, 'server' | 'client' | 'merge'> = {}
  ): ConflictResolutionResult {
    const conflicts = this.detectConflicts(serverData, clientData);
    const resolvedContractor: Contractor = { ...serverData };

    // Default priorities if not specified
    const defaultPriorities: Record<keyof Contractor, 'server' | 'client' | 'merge'> = {
      id: 'server',
      contractor_name: 'client',
      service_provided: 'client',
      status: 'server',
      contract_type: 'server',
      start_date: 'client',
      end_date: 'client',
      contract_monthly_amount: 'client',
      contract_yearly_amount: 'client',
      notes: 'merge',
      created_at: 'server',
      updated_at: 'server'
    };

    const priorities = { ...defaultPriorities, ...fieldPriorities };

    conflicts.forEach(conflict => {
      if (!conflict.hasConflict) return;

      const priority = priorities[conflict.field];

      switch (priority) {
        case 'client':
          resolvedContractor[conflict.field] = conflict.clientValue;
          break;
        case 'server':
          resolvedContractor[conflict.field] = conflict.serverValue;
          break;
        case 'merge':
          // Special merge logic for specific fields
          if (conflict.field === 'notes') {
            const serverNotes = String(conflict.serverValue || '');
            const clientNotes = String(conflict.clientValue || '');
            
            // Merge notes by combining unique content
            const mergedNotes = this.mergeNotes(serverNotes, clientNotes);
            resolvedContractor[conflict.field] = mergedNotes;
          } else {
            // Default to client for other merge fields
            resolvedContractor[conflict.field] = conflict.clientValue;
          }
          break;
      }
    });

    return {
      resolvedContractor,
      conflicts,
      strategy: 'field-priority',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Timestamp-based strategy: Use the most recently modified data
   */
  static resolveByTimestamp(
    serverData: Contractor, 
    clientData: Contractor
  ): ConflictResolutionResult {
    const conflicts = this.detectConflicts(serverData, clientData);
    
    // Compare update timestamps
    const serverTime = new Date(serverData.updated_at).getTime();
    const clientTime = new Date(clientData.updated_at).getTime();
    
    // Use the more recent data
    const resolvedContractor = serverTime > clientTime ? serverData : {
      ...clientData,
      id: serverData.id,
      created_at: serverData.created_at,
      updated_at: serverData.updated_at
    };

    return {
      resolvedContractor,
      conflicts,
      strategy: 'timestamp-based',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Interactive strategy: Prepare data for user decision
   */
  static prepareInteractiveResolution(
    serverData: Contractor, 
    clientData: Contractor
  ): ConflictResolutionResult {
    const conflicts = this.detectConflicts(serverData, clientData);
    
    // Start with server data, user will choose field by field
    const resolvedContractor: Contractor = { ...serverData };

    return {
      resolvedContractor,
      conflicts: conflicts.filter(c => c.hasConflict), // Only return actual conflicts
      strategy: 'interactive',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Merge notes intelligently
   */
  private static mergeNotes(serverNotes: string, clientNotes: string): string {
    if (!serverNotes && !clientNotes) return '';
    if (!serverNotes) return clientNotes;
    if (!clientNotes) return serverNotes;
    if (serverNotes === clientNotes) return serverNotes;

    // Split into lines and merge unique content
    const serverLines = serverNotes.split('\n').map(line => line.trim()).filter(Boolean);
    const clientLines = clientNotes.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Combine unique lines
    const allLines = [...new Set([...serverLines, ...clientLines])];
    
    // Add a separator if both had content
    if (serverLines.length > 0 && clientLines.length > 0) {
      return `${serverNotes}\n\n--- Merged with client changes ---\n${clientNotes}`;
    }
    
    return allLines.join('\n');
  }

  /**
   * Get conflict summary for logging/display
   */
  static getConflictSummary(conflicts: ConflictDetails[]): string {
    const conflictFields = conflicts.filter(c => c.hasConflict);
    
    if (conflictFields.length === 0) {
      return 'No conflicts detected';
    }

    const fieldNames = conflictFields.map(c => c.field).join(', ');
    return `Conflicts in ${conflictFields.length} field(s): ${fieldNames}`;
  }

  /**
   * Validate resolved contractor data
   */
  static validateResolution(resolvedContractor: Contractor): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation
    if (!resolvedContractor.contractor_name?.trim()) {
      errors.push('Contractor name is required');
    }

    if (!resolvedContractor.service_provided?.trim()) {
      errors.push('Service description is required');
    }

    if (!['Active', 'Expired', 'Pending'].includes(resolvedContractor.status)) {
      errors.push('Invalid status value');
    }

    if (!['Contract', 'PO'].includes(resolvedContractor.contract_type)) {
      errors.push('Invalid contract type');
    }

    // Date validation
    const startDate = new Date(resolvedContractor.start_date);
    const endDate = new Date(resolvedContractor.end_date);
    
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    }
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    // Amount validation
    if (resolvedContractor.contract_monthly_amount !== null && 
        resolvedContractor.contract_monthly_amount < 0) {
      errors.push('Monthly amount cannot be negative');
    }

    if (resolvedContractor.contract_yearly_amount !== null && 
        resolvedContractor.contract_yearly_amount < 0) {
      errors.push('Yearly amount cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ContractorConflictResolver;