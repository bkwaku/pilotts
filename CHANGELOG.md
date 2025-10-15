# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial Rails 8.0.3 application setup with PostgreSQL database
- Docker containerization for development and production
  - `Dockerfile` for production deployment
  - `Dockerfile.dev` for development environment
  - `docker-compose.yml` for local development orchestration
- Comprehensive documentation
  - README.md with detailed setup instructions
  - CONTRIBUTING.md with development guidelines
  - Quick start script (`start.sh`) for easy setup
  - Makefile with convenient shortcuts for common tasks
- Environment configuration with `.env.example`
- Health check endpoint at `/up`
- Default Rails 8 features:
  - Propshaft for asset pipeline
  - Importmap for JavaScript management
  - Hotwire (Turbo + Stimulus) for reactive interfaces
  - Solid Cache, Solid Queue, and Solid Cable for caching and background jobs
  - RuboCop for code quality
  - Brakeman for security scanning
  - System tests with Capybara and Selenium

### Configuration
- PostgreSQL 16 as the database
- Ruby 3.2.3
- Rails 8.0.3
- Docker Compose V2 support
- Automatic database preparation on container start
- Volume mounting for live code reloading
- Health checks for PostgreSQL service

[Unreleased]: https://github.com/bkwaku/pilotts/compare/...HEAD
