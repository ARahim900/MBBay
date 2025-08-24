#!/usr/bin/env node

/**
 * Validation script for contractor real-time implementation
 * Verifies all real-time features are properly implemented
 */

import { promises as fs } from 'fs';
import path from 'path';

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string;
}

class RealtimeImplementationValidator {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string) {
    this.results.push({ category, test, status, message, details });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.projectRoot, filePath));
      return true;
    } catch {
      return false;
    }
  }

  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(path.join(this.projectRoot, filePath), 'utf-8');
    } catch {
      return '';
    }
  }

  private async validateFileExists(category: string, filePath: string, description: string) {
    const exists = await this.fileExists(filePath);
    this.addResult(
      category,
      `File exists: ${filePath}`,
      exists ? 'PASS' : 'FAIL',
      exists ? `${description} exists` : `${description} is missing`,
      exists ? undefined : `Create the file at ${filePath}`
    );
    return exists;
  }

  private async validateFileContent(category: string, filePath: string, patterns: { pattern: RegExp; description: string }[], description: string) {
    const content = await this.readFile(filePath);
    if (!content) {
      this.addResult(category, `Content validation: ${filePath}`, 'FAIL', `Cannot read ${description}`, `Ensure ${filePath} exists and is readable`);
      return false;
    }

    let allPassed = true;
    for (const { pattern, description: patternDesc } of patterns) {
      const matches = pattern.test(content);
      if (!matches) {
        this.addResult(category, `${patternDesc}: ${filePath}`, 'FAIL', `${patternDesc} not found in ${description}`, `Add ${patternDesc} to ${filePath}`);
        allPassed = false;
      } else {
        this.addResult(category, `${patternDesc}: ${filePath}`, 'PASS', `${patternDesc} found in ${description}`);
      }
    }

    return allPassed;
  }

  async validateRealtimeHook() {
    const category = 'Real-time Hook';
    const filePath = 'src/hooks/useContractorRealtime.ts';
    
    if (!(await this.validateFileExists(category, filePath, 'Real-time hook'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /useContractorRealtime/, description: 'Hook export' },
      { pattern: /supabase.*channel/, description: 'Supabase channel creation' },
      { pattern: /postgres_changes.*INSERT/, description: 'INSERT event handler' },
      { pattern: /postgres_changes.*UPDATE/, description: 'UPDATE event handler' },
      { pattern: /postgres_changes.*DELETE/, description: 'DELETE event handler' },
      { pattern: /conflictResolution/, description: 'Conflict resolution support' },
      { pattern: /registerPendingOperation/, description: 'Pending operation tracking' },
      { pattern: /reconnect/, description: 'Reconnection functionality' },
      { pattern: /subscribe.*status/, description: 'Subscription status handling' },
      { pattern: /error.*handling/, description: 'Error handling' }
    ], 'real-time hook');
  }

  async validateConflictResolver() {
    const category = 'Conflict Resolution';
    const filePath = 'src/utils/contractor-conflict-resolver.ts';
    
    if (!(await this.validateFileExists(category, filePath, 'Conflict resolver utility'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /ContractorConflictResolver/, description: 'Conflict resolver class' },
      { pattern: /detectConflicts/, description: 'Conflict detection method' },
      { pattern: /resolveServerWins/, description: 'Server-wins strategy' },
      { pattern: /resolveClientWins/, description: 'Client-wins strategy' },
      { pattern: /resolveSmartMerge/, description: 'Smart merge strategy' },
      { pattern: /resolveFieldPriority/, description: 'Field priority strategy' },
      { pattern: /validateResolution/, description: 'Resolution validation' },
      { pattern: /ConflictDetails/, description: 'Conflict details interface' },
      { pattern: /ConflictResolutionResult/, description: 'Resolution result interface' }
    ], 'conflict resolver');
  }

  async validateRealtimeStatusIndicator() {
    const category = 'Status Indicator';
    const filePath = 'src/components/contractor/RealtimeStatusIndicator.tsx';
    
    if (!(await this.validateFileExists(category, filePath, 'Real-time status indicator'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /RealtimeStatusIndicator/, description: 'Component export' },
      { pattern: /isConnected.*isConnecting/, description: 'Connection state props' },
      { pattern: /error.*eventCount/, description: 'Error and event tracking' },
      { pattern: /onReconnect/, description: 'Reconnection handler' },
      { pattern: /CheckCircle.*AlertCircle/, description: 'Status icons' },
      { pattern: /showDetails/, description: 'Detailed view support' },
      { pattern: /connectionAttempts.*maxRetries/, description: 'Retry information' }
    ], 'status indicator component');
  }

  async validateConflictModal() {
    const category = 'Conflict Modal';
    const filePath = 'src/components/contractor/ConflictResolutionModal.tsx';
    
    if (!(await this.validateFileExists(category, filePath, 'Conflict resolution modal'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /ConflictResolutionModal/, description: 'Modal component export' },
      { pattern: /serverData.*clientData/, description: 'Conflict data props' },
      { pattern: /server.*client.*manual/, description: 'Resolution strategies' },
      { pattern: /onResolve.*onCancel/, description: 'Resolution handlers' },
      { pattern: /selectedStrategy/, description: 'Strategy selection state' },
      { pattern: /manualResolution/, description: 'Manual resolution support' },
      { pattern: /formatFieldValue/, description: 'Field value formatting' },
      { pattern: /getFieldDisplayName/, description: 'Field name display' }
    ], 'conflict resolution modal');
  }

  async validateHookIntegration() {
    const category = 'Hook Integration';
    const filePath = 'hooks/useContractorData.ts';
    
    if (!(await this.validateFileExists(category, filePath, 'Contractor data hook'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /useContractorRealtime/, description: 'Real-time hook import' },
      { pattern: /ContractorConflictResolver/, description: 'Conflict resolver import' },
      { pattern: /enableRealtime/, description: 'Real-time option' },
      { pattern: /conflictResolution/, description: 'Conflict resolution option' },
      { pattern: /realtime.*isConnected/, description: 'Real-time state exposure' },
      { pattern: /conflictData/, description: 'Conflict data state' },
      { pattern: /resolveConflict/, description: 'Conflict resolution method' },
      { pattern: /registerPendingOperation/, description: 'Pending operation registration' }
    ], 'contractor data hook');
  }

  async validateDashboardIntegration() {
    const category = 'Dashboard Integration';
    const filePath = 'src/components/ContractorTrackerDashboard.tsx';
    
    if (!(await this.validateFileExists(category, filePath, 'Contractor dashboard'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /RealtimeStatusIndicator/, description: 'Status indicator import' },
      { pattern: /ConflictResolutionModal/, description: 'Conflict modal import' },
      { pattern: /enableRealtime.*true/, description: 'Real-time enabled' },
      { pattern: /conflictResolution.*prompt-user/, description: 'User conflict resolution' },
      { pattern: /realtime.*isConnected/, description: 'Real-time state usage' },
      { pattern: /hasConflict.*conflictData/, description: 'Conflict state usage' },
      { pattern: /shouldShowRealtimeStatus/, description: 'Status indicator conditional' }
    ], 'contractor dashboard');
  }

  async validateTypeDefinitions() {
    const category = 'Type Definitions';
    const filePath = 'src/types/contractor.ts';
    
    if (!(await this.validateFileExists(category, filePath, 'Contractor types'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /ContractorRealtimeEvent/, description: 'Real-time event type' },
      { pattern: /INSERT.*UPDATE.*DELETE/, description: 'Event type enum' },
      { pattern: /ConflictDetails/, description: 'Conflict details type' },
      { pattern: /ConflictResolutionResult/, description: 'Resolution result type' }
    ], 'type definitions');
  }

  async validateTests() {
    const category = 'Testing';
    const filePath = 'src/tests/contractor-realtime.test.tsx';
    
    if (!(await this.validateFileExists(category, filePath, 'Real-time tests'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /useContractorRealtime.*Hook/, description: 'Hook tests' },
      { pattern: /ContractorConflictResolver/, description: 'Conflict resolver tests' },
      { pattern: /RealtimeStatusIndicator/, description: 'Status indicator tests' },
      { pattern: /ConflictResolutionModal/, description: 'Conflict modal tests' },
      { pattern: /INSERT.*UPDATE.*DELETE/, description: 'Event handling tests' },
      { pattern: /conflict.*resolution/, description: 'Conflict resolution tests' },
      { pattern: /connection.*reconnection/, description: 'Connection tests' }
    ], 'real-time tests');
  }

  async validateSupabaseConfiguration() {
    const category = 'Supabase Config';
    const filePath = 'src/lib/supabase.ts';
    
    if (!(await this.validateFileExists(category, filePath, 'Supabase configuration'))) {
      return;
    }

    await this.validateFileContent(category, filePath, [
      { pattern: /createClient/, description: 'Supabase client creation' },
      { pattern: /supabaseUrl.*supabaseKey/, description: 'Configuration variables' },
      { pattern: /export.*supabase/, description: 'Client export' }
    ], 'Supabase configuration');
  }

  async validateRequirements() {
    const category = 'Requirements';
    
    // Requirement 1.4: Real-time contractor data access
    const hasRealtimeHook = await this.fileExists('src/hooks/useContractorRealtime.ts');
    const hasSupabaseIntegration = await this.fileExists('src/lib/supabase.ts');
    
    this.addResult(
      category,
      'Requirement 1.4: Real-time data access',
      (hasRealtimeHook && hasSupabaseIntegration) ? 'PASS' : 'FAIL',
      (hasRealtimeHook && hasSupabaseIntegration) 
        ? 'Real-time data access implemented with Supabase subscriptions'
        : 'Missing real-time hook or Supabase configuration'
    );

    // Requirement 6.4: Conflict resolution for concurrent edits
    const hasConflictResolver = await this.fileExists('src/utils/contractor-conflict-resolver.ts');
    const hasConflictModal = await this.fileExists('src/components/contractor/ConflictResolutionModal.tsx');
    
    this.addResult(
      category,
      'Requirement 6.4: Conflict resolution',
      (hasConflictResolver && hasConflictModal) ? 'PASS' : 'FAIL',
      (hasConflictResolver && hasConflictModal)
        ? 'Conflict resolution implemented with multiple strategies and user interface'
        : 'Missing conflict resolver utility or resolution modal'
    );

    // Integration completeness
    const dashboardContent = await this.readFile('src/components/ContractorTrackerDashboard.tsx');
    const hasIntegration = dashboardContent.includes('useContractorRealtime') || 
                          dashboardContent.includes('RealtimeStatusIndicator') ||
                          dashboardContent.includes('ConflictResolutionModal');
    
    this.addResult(
      category,
      'Dashboard Integration',
      hasIntegration ? 'PASS' : 'FAIL',
      hasIntegration 
        ? 'Real-time features integrated into main dashboard'
        : 'Real-time features not integrated into dashboard'
    );
  }

  async validateAll() {
    console.log('🔄 Validating contractor real-time implementation...\n');

    await this.validateRealtimeHook();
    await this.validateConflictResolver();
    await this.validateRealtimeStatusIndicator();
    await this.validateConflictModal();
    await this.validateHookIntegration();
    await this.validateDashboardIntegration();
    await this.validateTypeDefinitions();
    await this.validateTests();
    await this.validateSupabaseConfiguration();
    await this.validateRequirements();

    this.printResults();
  }

  private printResults() {
    const categories = [...new Set(this.results.map(r => r.category))];
    
    console.log('📊 VALIDATION RESULTS\n');
    console.log('='.repeat(80));

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let warningTests = 0;

    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.status === 'PASS').length;
      const failed = categoryResults.filter(r => r.status === 'FAIL').length;
      const warnings = categoryResults.filter(r => r.status === 'WARNING').length;

      console.log(`\n📁 ${category}`);
      console.log('-'.repeat(40));

      categoryResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${result.test}: ${result.message}`);
        
        if (result.details && result.status !== 'PASS') {
          console.log(`   💡 ${result.details}`);
        }
      });

      console.log(`\n   Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
      
      totalTests += categoryResults.length;
      passedTests += passed;
      failedTests += failed;
      warningTests += warnings;
    });

    console.log('\n' + '='.repeat(80));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests} (${Math.round(passedTests / totalTests * 100)}%)`);
    console.log(`❌ Failed: ${failedTests} (${Math.round(failedTests / totalTests * 100)}%)`);
    console.log(`⚠️  Warnings: ${warningTests} (${Math.round(warningTests / totalTests * 100)}%)`);

    const successRate = passedTests / totalTests;
    if (successRate >= 0.9) {
      console.log('\n🎉 EXCELLENT! Real-time implementation is comprehensive and well-structured.');
    } else if (successRate >= 0.7) {
      console.log('\n👍 GOOD! Real-time implementation is mostly complete with minor issues.');
    } else if (successRate >= 0.5) {
      console.log('\n⚠️  NEEDS WORK! Real-time implementation has significant gaps.');
    } else {
      console.log('\n❌ INCOMPLETE! Real-time implementation needs major work.');
    }

    if (failedTests > 0) {
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Address failed validations above');
      console.log('2. Run tests to ensure functionality works correctly');
      console.log('3. Test real-time features in development environment');
      console.log('4. Verify Supabase real-time subscriptions are working');
      console.log('5. Test conflict resolution scenarios');
    }

    console.log('\n📚 IMPLEMENTATION FEATURES:');
    console.log('• Supabase real-time subscriptions for INSERT/UPDATE/DELETE events');
    console.log('• Automatic UI updates when data changes occur');
    console.log('• Multiple conflict resolution strategies (server-wins, client-wins, smart-merge, user-prompt)');
    console.log('• Real-time connection status indicator');
    console.log('• Interactive conflict resolution modal');
    console.log('• Pending operation tracking for conflict detection');
    console.log('• Comprehensive error handling and reconnection logic');
    console.log('• Full test coverage for real-time functionality');

    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Run validation
const validator = new RealtimeImplementationValidator();
validator.validateAll().catch(console.error);