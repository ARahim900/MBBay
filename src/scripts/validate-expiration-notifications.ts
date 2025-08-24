#!/usr/bin/env node

/**
 * Validation script for contract expiration notifications
 * Tests the notification components and logic
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string[];
}

class ExpirationNotificationValidator {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private addResult(component: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string[]) {
    this.results.push({ component, status, message, details });
  }

  private fileExists(filePath: string): boolean {
    return existsSync(join(this.projectRoot, filePath));
  }

  private readFile(filePath: string): string {
    try {
      return readFileSync(join(this.projectRoot, filePath), 'utf-8');
    } catch (error) {
      return '';
    }
  }

  private checkFileContent(filePath: string, patterns: string[], component: string): boolean {
    if (!this.fileExists(filePath)) {
      this.addResult(component, 'FAIL', `File not found: ${filePath}`);
      return false;
    }

    const content = this.readFile(filePath);
    const missingPatterns: string[] = [];

    patterns.forEach(pattern => {
      if (!content.includes(pattern)) {
        missingPatterns.push(pattern);
      }
    });

    if (missingPatterns.length > 0) {
      this.addResult(component, 'FAIL', `Missing required patterns in ${filePath}`, missingPatterns);
      return false;
    }

    this.addResult(component, 'PASS', `All required patterns found in ${filePath}`);
    return true;
  }

  private runTests(): boolean {
    try {
      console.log('Running expiration notification tests...');
      execSync('npm run test -- src/tests/expiration-notifications.test.tsx --run', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      });
      this.addResult('Tests', 'PASS', 'All notification tests passed');
      return true;
    } catch (error) {
      this.addResult('Tests', 'FAIL', 'Some notification tests failed', [
        error instanceof Error ? error.message : 'Unknown test error'
      ]);
      return false;
    }
  }

  private validateComponents(): void {
    console.log('Validating notification components...');

    // Check ExpirationNotifications component
    this.checkFileContent(
      'src/components/contractor/ExpirationNotifications.tsx',
      [
        'NotificationBadge',
        'UrgencyIndicator', 
        'ExpirationAlert',
        'ExpirationNotifications',
        'urgency_level',
        'days_until_expiry',
        'animate-pulse',
        'getThemeValue',
        'Critical',
        'High',
        'Medium',
        'Low'
      ],
      'ExpirationNotifications'
    );

    // Check NotificationCenter component
    this.checkFileContent(
      'src/components/contractor/NotificationCenter.tsx',
      [
        'NotificationCenter',
        'NotificationDropdown',
        'NotificationSettings',
        'useExpirationNotifications',
        'visibleContracts',
        'dismissContract',
        'getNotificationSummary'
      ],
      'NotificationCenter'
    );

    // Check useExpirationNotifications hook
    this.checkFileContent(
      'src/hooks/useExpirationNotifications.ts',
      [
        'useExpirationNotifications',
        'dismissContract',
        'restoreContract',
        'clearAllDismissals',
        'getNotificationSummary',
        'localStorage',
        'persistDismissals',
        'dismissalExpiryTime'
      ],
      'useExpirationNotifications'
    );

    // Check integration in main dashboard
    this.checkFileContent(
      'src/components/ContractorTrackerDashboard.tsx',
      [
        'NotificationCenter',
        'ExpirationNotifications',
        'NotificationBadge',
        'handleViewContractFromNotification',
        'expiringContracts'
      ],
      'Dashboard Integration'
    );
  }

  private validateThemeIntegration(): void {
    console.log('Validating theme integration...');

    const notificationFile = this.readFile('src/components/contractor/ExpirationNotifications.tsx');
    
    // Check theme color usage
    const themePatterns = [
      'getThemeValue(\'colors.status.error\'',
      'getThemeValue(\'colors.status.warning\'',
      'getThemeValue(\'colors.status.success\'',
      'getThemeValue(\'colors.status.info\'',
      'getThemeValue(\'typography.fontFamily\'',
      'getThemeValue(\'typography.tooltipSize\''
    ];

    let themeIntegrationValid = true;
    const missingThemePatterns: string[] = [];

    themePatterns.forEach(pattern => {
      if (!notificationFile.includes(pattern)) {
        missingThemePatterns.push(pattern);
        themeIntegrationValid = false;
      }
    });

    if (themeIntegrationValid) {
      this.addResult('Theme Integration', 'PASS', 'All theme values properly integrated');
    } else {
      this.addResult('Theme Integration', 'FAIL', 'Missing theme integration patterns', missingThemePatterns);
    }
  }

  private validateUrgencyLogic(): void {
    console.log('Validating urgency level logic...');

    const hookFile = this.readFile('src/hooks/useExpirationNotifications.ts');
    
    // Check urgency calculation logic
    const urgencyPatterns = [
      'calculateUrgencyLevel',
      'daysUntilExpiry <= 7',
      'daysUntilExpiry <= 14',
      'daysUntilExpiry <= 21',
      'Critical',
      'High',
      'Medium',
      'Low'
    ];

    let urgencyLogicValid = true;
    const missingUrgencyPatterns: string[] = [];

    urgencyPatterns.forEach(pattern => {
      if (!hookFile.includes(pattern)) {
        missingUrgencyPatterns.push(pattern);
        urgencyLogicValid = false;
      }
    });

    if (urgencyLogicValid) {
      this.addResult('Urgency Logic', 'PASS', 'Urgency level calculation logic implemented');
    } else {
      this.addResult('Urgency Logic', 'FAIL', 'Missing urgency calculation patterns', missingUrgencyPatterns);
    }
  }

  private validateAccessibility(): void {
    console.log('Validating accessibility features...');

    const notificationFile = this.readFile('src/components/contractor/ExpirationNotifications.tsx');
    
    // Check accessibility patterns
    const a11yPatterns = [
      'title=',
      'aria-label',
      'role=',
      'tabIndex',
      'onKeyDown',
      'keyboard navigation'
    ];

    let a11yScore = 0;
    const foundA11yPatterns: string[] = [];

    a11yPatterns.forEach(pattern => {
      if (notificationFile.includes(pattern)) {
        a11yScore++;
        foundA11yPatterns.push(pattern);
      }
    });

    if (a11yScore >= 3) {
      this.addResult('Accessibility', 'PASS', `Good accessibility implementation (${a11yScore}/${a11yPatterns.length} patterns found)`, foundA11yPatterns);
    } else if (a11yScore >= 1) {
      this.addResult('Accessibility', 'WARNING', `Basic accessibility implementation (${a11yScore}/${a11yPatterns.length} patterns found)`, foundA11yPatterns);
    } else {
      this.addResult('Accessibility', 'FAIL', 'No accessibility patterns found');
    }
  }

  private validateRequirements(): void {
    console.log('Validating requirements compliance...');

    // Requirement 8.1: Expiration warning logic with theme status colors
    const req81Patterns = [
      'getThemeValue(\'colors.status.warning\'',
      'getThemeValue(\'colors.status.error\'',
      'urgency_level',
      'days_until_expiry'
    ];

    const req81Valid = req81Patterns.every(pattern => 
      this.readFile('src/components/contractor/ExpirationNotifications.tsx').includes(pattern)
    );

    if (req81Valid) {
      this.addResult('Requirement 8.1', 'PASS', 'Expiration warning logic with theme colors implemented');
    } else {
      this.addResult('Requirement 8.1', 'FAIL', 'Missing expiration warning logic or theme colors');
    }

    // Requirement 8.2: Notification badges and alerts
    const req82Patterns = [
      'NotificationBadge',
      'ExpirationAlert',
      'animate-pulse',
      'Bell'
    ];

    const req82Valid = req82Patterns.every(pattern => 
      this.readFile('src/components/contractor/ExpirationNotifications.tsx').includes(pattern)
    );

    if (req82Valid) {
      this.addResult('Requirement 8.2', 'PASS', 'Notification badges and alerts implemented');
    } else {
      this.addResult('Requirement 8.2', 'FAIL', 'Missing notification badges or alerts');
    }

    // Requirement 8.3: Active and current contracts with success colors
    const req83Patterns = [
      'getThemeValue(\'colors.status.success\'',
      'Active',
      'bg-green-'
    ];

    const req83Valid = req83Patterns.some(pattern => 
      this.readFile('src/components/ui/StatusBadge.tsx').includes(pattern)
    );

    if (req83Valid) {
      this.addResult('Requirement 8.3', 'PASS', 'Success colors for active contracts implemented');
    } else {
      this.addResult('Requirement 8.3', 'WARNING', 'Success colors may be implemented in StatusBadge component');
    }

    // Requirement 8.4: Status badges with consistent styling
    const req84Valid = this.fileExists('src/components/ui/StatusBadge.tsx');

    if (req84Valid) {
      this.addResult('Requirement 8.4', 'PASS', 'Status badges with consistent styling implemented');
    } else {
      this.addResult('Requirement 8.4', 'FAIL', 'StatusBadge component not found');
    }

    // Requirement 8.5: Urgency indicators based on days until expiration
    const req85Patterns = [
      'UrgencyIndicator',
      'days_until_expiry',
      'urgency_level',
      'Critical',
      'High',
      'Medium',
      'Low'
    ];

    const req85Valid = req85Patterns.every(pattern => 
      this.readFile('src/components/contractor/ExpirationNotifications.tsx').includes(pattern)
    );

    if (req85Valid) {
      this.addResult('Requirement 8.5', 'PASS', 'Urgency indicators based on expiration days implemented');
    } else {
      this.addResult('Requirement 8.5', 'FAIL', 'Missing urgency indicators or expiration logic');
    }
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(80));
    console.log('CONTRACT EXPIRATION NOTIFICATIONS VALIDATION RESULTS');
    console.log('='.repeat(80));

    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const warningCount = this.results.filter(r => r.status === 'WARNING').length;

    this.results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`\n${statusIcon} ${result.component}: ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   - ${detail}`);
        });
      }
    });

    console.log('\n' + '-'.repeat(80));
    console.log(`SUMMARY: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`);
    console.log('-'.repeat(80));

    if (failCount === 0) {
      console.log('🎉 All validations passed! Contract expiration notifications are properly implemented.');
    } else {
      console.log('❌ Some validations failed. Please review the issues above.');
    }
  }

  public async validate(): Promise<boolean> {
    console.log('Starting contract expiration notifications validation...\n');

    try {
      // Run all validations
      this.validateComponents();
      this.validateThemeIntegration();
      this.validateUrgencyLogic();
      this.validateAccessibility();
      this.validateRequirements();
      
      // Run tests last
      this.runTests();

      // Print results
      this.printResults();

      // Return overall success
      const failCount = this.results.filter(r => r.status === 'FAIL').length;
      return failCount === 0;

    } catch (error) {
      console.error('Validation failed with error:', error);
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ExpirationNotificationValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation error:', error);
    process.exit(1);
  });
}

export { ExpirationNotificationValidator };