# Bugfix Requirements Document

## Introduction

The UpSkills Hub backend application fails to connect to the database and start the server correctly due to multiple configuration issues involving port mismanagement, hardcoded SSL settings, and lack of environment-specific configurations. These issues prevent the application from functioning in both development (local) and production environments.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the server starts THEN the system uses `process.env.DB_PORT` instead of `process.env.PORT` for the application server port (line 88 in src/app.js)

1.2 WHEN the database connection is initialized in src/config/db.js THEN the system defaults to port 4000 which conflicts with the server PORT defined in .env.example

1.3 WHEN the database connection is attempted in any environment THEN the system enforces SSL with `rejectUnauthorized: true`, causing connection failures in local development environments without SSL certificates

1.4 WHEN the application runs in development mode THEN the system applies the same production-level SSL and pooling configurations, preventing local database connections

1.5 WHEN environment variables are read THEN the system exhibits port confusion between PORT (application server), DB_PORT (database), with .env.example showing PORT=4000 but missing DB_PORT definition

### Expected Behavior (Correct)

2.1 WHEN the server starts THEN the system SHALL use `process.env.PORT` for the application server port with a default of 5000

2.2 WHEN the database connection is initialized THEN the system SHALL use `process.env.DB_PORT` for the database port with a default of 3306 (MySQL standard port)

2.3 WHEN the database connection is attempted in development mode THEN the system SHALL disable SSL requirements (no dialectOptions.ssl configuration)

2.4 WHEN the database connection is attempted in production mode THEN the system SHALL enforce SSL with `rejectUnauthorized: true` only in production environments

2.5 WHEN environment variables are configured THEN the system SHALL clearly separate PORT (for Express server) and DB_PORT (for MySQL database) with appropriate defaults and documentation in .env.example

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the database connection is successful THEN the system SHALL CONTINUE TO log "✅ Sequelize connected to database successfully"

3.2 WHEN the database connection fails THEN the system SHALL CONTINUE TO log the error message and prevent the server from starting

3.3 WHEN the server starts successfully THEN the system SHALL CONTINUE TO log "Server running on port {PORT}" and "API URL: http://localhost:{PORT}/api"

3.4 WHEN production environment is detected THEN the system SHALL CONTINUE TO use connection pooling with max: 5, min: 0, acquire: 30000, idle: 10000

3.5 WHEN all routes and middleware are registered THEN the system SHALL CONTINUE TO function with all existing API endpoints, authentication, and error handling
