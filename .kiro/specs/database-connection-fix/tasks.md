# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Configuration Errors Prevent Application Startup
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that server uses wrong port variable (DB_PORT instead of PORT)
  - Test that database uses wrong default port (4000 instead of 3306)
  - Test that SSL is enforced in development environment (causing connection failures)
  - Test that .env.example has PORT=4000 which doesn't match app.js default of 5000
  - The test assertions should match Expected Behavior (requirements 2.1-2.5) from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Functionality Remains Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Test that database connection success logging produces "✅ Sequelize connected to database successfully"
  - Test that database connection failure logging and server exit behavior are unchanged
  - Test that server startup success logging displays port and API URL correctly
  - Test that production connection pooling (max: 5, min: 0, acquire: 30000, idle: 10000) remains unchanged
  - Test that all API endpoints, routes, middleware, authentication, and error handling continue to function
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for database connection configuration errors

  - [x] 3.1 Correct server port variable in src/app.js
    - Change `const PORT = process.env.DB_PORT || 5000;` to `const PORT = process.env.PORT || 5000;`
    - This ensures Express server uses the correct environment variable
    - _Bug_Condition: isBugCondition(input) where input.action == "START_SERVER" AND serverUsesWrongPortVariable()_
    - _Expected_Behavior: Server SHALL use process.env.PORT for application server port with default of 5000_
    - _Preservation: Server startup success logging displaying port and API URL must remain unchanged_
    - _Requirements: 1.1, 2.1, 3.3_

  - [x] 3.2 Update database port default in src/config/db.js
    - Change `port: process.env.DB_PORT || 4000,` to `port: process.env.DB_PORT || 3306,`
    - This uses MySQL's standard port 3306 as the default
    - _Bug_Condition: isBugCondition(input) where input.action == "CONNECT_DATABASE" AND databaseUsesWrongDefaultPort()_
    - _Expected_Behavior: Database SHALL use process.env.DB_PORT with default of 3306_
    - _Preservation: Database connection success/failure logging must remain unchanged_
    - _Requirements: 1.2, 2.2, 3.1, 3.2_

  - [x] 3.3 Implement environment-aware SSL configuration in src/config/db.js
    - Replace hardcoded dialectOptions with conditional: `dialectOptions: process.env.NODE_ENV === 'production' ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } } : {}`
    - This disables SSL in development and enables it only in production
    - _Bug_Condition: isBugCondition(input) where input.action == "CONNECT_DATABASE" AND input.environment == "development" AND sslIsEnforced()_
    - _Expected_Behavior: SSL SHALL be disabled in development, enabled only in production_
    - _Preservation: Production connection pooling and SSL configuration must remain unchanged_
    - _Requirements: 1.3, 1.4, 2.3, 2.4, 3.4_

  - [x] 3.4 Update src/config/config.js for consistency
    - Add `port: process.env.DB_PORT || 3306,` to development configuration object
    - Change production port default from 4000 to 3306: `port: process.env.DB_PORT || 3306,`
    - Ensure development configuration does not include dialectOptions.ssl
    - _Bug_Condition: isBugCondition(input) where NOT environmentSpecificConfigExists()_
    - _Expected_Behavior: Both development and production configs SHALL use consistent port defaults_
    - _Preservation: All existing configuration behavior must remain unchanged_
    - _Requirements: 1.4, 2.2, 2.3, 2.4_

  - [x] 3.5 Update .env.example documentation
    - Change `PORT=4000` to `PORT=5000` to match src/app.js default
    - Add `DB_PORT=3306` to DATABASE CONFIGURATION section
    - Add comment: `# PORT - Express application server port`
    - Add comment: `# DB_PORT - MySQL database port`
    - _Bug_Condition: isBugCondition(input) where port confusion exists in documentation_
    - _Expected_Behavior: Documentation SHALL clearly separate PORT and DB_PORT with correct defaults_
    - _Preservation: All other environment variable documentation must remain unchanged_
    - _Requirements: 1.5, 2.5_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Configuration Correctly Enables Application Startup
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Functionality Remains Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
