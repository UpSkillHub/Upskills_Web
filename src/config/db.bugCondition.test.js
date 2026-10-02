/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * When this test passes after implementation, it confirms the expected behavior is satisfied.
 * 
 * Bug Conditions Being Tested:
 * 1. Server uses wrong port variable (DB_PORT instead of PORT)
 * 2. Database uses wrong default port (4000 instead of 3306)
 * 3. SSL is enforced in development environment
 * 4. .env.example has PORT=4000 which doesn't match app.js default of 5000
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Bug Condition Exploration Test - Configuration Errors Prevent Application Startup', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('Property 1.1: Server MUST use PORT variable (not DB_PORT) for Express server', async () => {
    /**
     * Bug Condition: Server uses process.env.DB_PORT instead of process.env.PORT
     * Expected Behavior (Requirement 2.1): Server SHALL use process.env.PORT with default 5000
     */
    
    // Read the app.js file to check the PORT variable usage
    const appJsPath = join(__dirname, '../app.js');
    const appJsContent = readFileSync(appJsPath, 'utf-8');
    
    // Find the line that defines PORT
    const portLineMatch = appJsContent.match(/const PORT = process\.env\.(\w+) \|\| (\d+);/);
    
    expect(portLineMatch, 'PORT variable definition not found in app.js').toBeTruthy();
    
    const [, envVariable, defaultPort] = portLineMatch;
    
    // EXPECTED BEHAVIOR: Should use PORT variable
    expect(envVariable).toBe('PORT');
    
    // EXPECTED BEHAVIOR: Default should be 5000
    expect(defaultPort).toBe('5000');
  });

  test('Property 1.2: Database MUST use MySQL standard port 3306 as default (not 4000)', async () => {
    /**
     * Bug Condition: Database defaults to port 4000 instead of MySQL's standard 3306
     * Expected Behavior (Requirement 2.2): Database SHALL use DB_PORT with default 3306
     */
    
    // Read the db.js file to check the default port
    const dbJsPath = join(__dirname, 'db.js');
    const dbJsContent = readFileSync(dbJsPath, 'utf-8');
    
    // Find the port configuration line
    const portMatch = dbJsContent.match(/port:\s*process\.env\.DB_PORT \|\| (\d+),?/);
    
    expect(portMatch, 'DB_PORT configuration not found in db.js').toBeTruthy();
    
    const [, defaultPort] = portMatch;
    
    // EXPECTED BEHAVIOR: Default should be 3306 (MySQL standard port)
    expect(parseInt(defaultPort)).toBe(3306);
  });

  test('Property 1.3: SSL MUST be disabled in development (not enforced in all environments)', async () => {
    /**
     * Bug Condition: SSL is enforced with rejectUnauthorized: true in all environments
     * Expected Behavior (Requirement 2.3): SSL SHALL be disabled in development
     * Expected Behavior (Requirement 2.4): SSL SHALL be enabled only in production
     */
    
    // Read the db.js file to check SSL configuration
    const dbJsPath = join(__dirname, 'db.js');
    const dbJsContent = readFileSync(dbJsPath, 'utf-8');
    
    // Check if SSL is conditionally applied based on NODE_ENV
    const hasConditionalSSL = dbJsContent.includes('NODE_ENV') && 
                               dbJsContent.includes('production') &&
                               dbJsContent.includes('dialectOptions');
    
    // EXPECTED BEHAVIOR: SSL should be conditional on production environment
    expect(hasConditionalSSL).toBe(true);
    
    // Verify that dialectOptions is not hardcoded
    const hasHardcodedSSL = /dialectOptions:\s*{[\s\S]*?ssl:\s*{/.test(dbJsContent) &&
                            !dbJsContent.includes('process.env.NODE_ENV');
    
    // EXPECTED BEHAVIOR: SSL should NOT be hardcoded (must be environment-aware)
    expect(hasHardcodedSSL).toBe(false);
  });

  test('Property 1.4: config.js MUST have consistent port defaults (3306, not 4000)', async () => {
    /**
     * Bug Condition: config.js uses inconsistent port defaults (4000 in production)
     * Expected Behavior (Requirement 2.2): Both configs SHALL use 3306 as default
     */
    
    // Read the config.js file
    const configJsPath = join(__dirname, 'config.js');
    const configJsContent = readFileSync(configJsPath, 'utf-8');
    
    // Check production configuration port default
    const productionMatch = configJsContent.match(/production:\s*{[\s\S]*?port:\s*process\.env\.DB_PORT \|\| (\d+),?/);
    
    if (productionMatch) {
      const [, defaultPort] = productionMatch;
      // EXPECTED BEHAVIOR: Production default should be 3306
      expect(parseInt(defaultPort)).toBe(3306);
    }
    
    // Check if development has port configuration
    const developmentSection = configJsContent.match(/development:\s*{[\s\S]*?}/);
    const hasDevelopmentPort = developmentSection && developmentSection[0].includes('port:');
    
    // EXPECTED BEHAVIOR: Development should have port configuration for consistency
    expect(hasDevelopmentPort).toBe(true);
  });

  test('Property 1.5: .env.example MUST have PORT=5000 and define DB_PORT=3306', async () => {
    /**
     * Bug Condition: .env.example has PORT=4000 (doesn't match app.js default)
     * Bug Condition: .env.example doesn't define DB_PORT
     * Expected Behavior (Requirement 2.5): Clear separation of PORT and DB_PORT with correct defaults
     */
    
    // Read .env.example file
    const envExamplePath = join(__dirname, '../../.env.example');
    const envExampleContent = readFileSync(envExamplePath, 'utf-8');
    
    // Check PORT value
    const portMatch = envExampleContent.match(/^PORT=(\d+)/m);
    expect(portMatch, 'PORT not defined in .env.example').toBeTruthy();
    
    const [, portValue] = portMatch;
    // EXPECTED BEHAVIOR: PORT should be 5000 to match app.js default
    expect(portValue).toBe('5000');
    
    // Check DB_PORT value
    const dbPortMatch = envExampleContent.match(/^DB_PORT=(\d+)/m);
    // EXPECTED BEHAVIOR: DB_PORT should be defined
    expect(dbPortMatch, 'DB_PORT should be defined in .env.example').toBeTruthy();
    
    if (dbPortMatch) {
      const [, dbPortValue] = dbPortMatch;
      // EXPECTED BEHAVIOR: DB_PORT should be 3306 (MySQL standard)
      expect(dbPortValue).toBe('3306');
    }
  });

  test('Property 1: Integration - Configuration Errors Prevent Application Startup', () => {
    /**
     * Property-Based Test: For any configuration scenario in the bug condition domain,
     * the system MUST use correct port variables, defaults, and environment-specific settings.
     * 
     * This test uses scoped PBT approach for deterministic bugs.
     */
    
    fc.assert(
      fc.property(
        fc.constantFrom(
          // Concrete failing cases that demonstrate the bug
          { scenario: 'server_port', description: 'Server uses wrong port variable' },
          { scenario: 'db_port_default', description: 'Database uses wrong default port' },
          { scenario: 'ssl_enforcement', description: 'SSL enforced in development' },
          { scenario: 'env_example_mismatch', description: '.env.example has wrong PORT value' }
        ),
        (testCase) => {
          // Read relevant files
          const appJsPath = join(__dirname, '../app.js');
          const dbJsPath = join(__dirname, 'db.js');
          const configJsPath = join(__dirname, 'config.js');
          const envExamplePath = join(__dirname, '../../.env.example');
          
          const appJs = readFileSync(appJsPath, 'utf-8');
          const dbJs = readFileSync(dbJsPath, 'utf-8');
          const configJs = readFileSync(configJsPath, 'utf-8');
          const envExample = readFileSync(envExamplePath, 'utf-8');
          
          switch (testCase.scenario) {
            case 'server_port':
              // Verify server uses PORT (not DB_PORT)
              const portMatch = appJs.match(/const PORT = process\.env\.(\w+)/);
              return portMatch && portMatch[1] === 'PORT';
              
            case 'db_port_default':
              // Verify database defaults to 3306 (not 4000)
              const dbPortMatch = dbJs.match(/port:\s*process\.env\.DB_PORT \|\| (\d+)/);
              return dbPortMatch && parseInt(dbPortMatch[1]) === 3306;
              
            case 'ssl_enforcement':
              // Verify SSL is conditional on NODE_ENV
              return dbJs.includes('NODE_ENV') && dbJs.includes('production') &&
                     !(/dialectOptions:\s*{[\s\S]*?ssl:\s*{/.test(dbJs) && !dbJs.includes('process.env.NODE_ENV'));
              
            case 'env_example_mismatch':
              // Verify .env.example has PORT=5000 and DB_PORT=3306
              const envPortMatch = envExample.match(/^PORT=(\d+)/m);
              const envDbPortMatch = envExample.match(/^DB_PORT=(\d+)/m);
              return envPortMatch && envPortMatch[1] === '5000' &&
                     envDbPortMatch && envDbPortMatch[1] === '3306';
              
            default:
              return false;
          }
        }
      ),
      {
        numRuns: 100, // Run multiple times to ensure deterministic bugs are caught
        verbose: true
      }
    );
  });
});
