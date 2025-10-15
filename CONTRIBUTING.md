# Contributing to Pilotts

Thank you for your interest in contributing to Pilotts! This document provides guidelines for development.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pilotts
   ```

2. **Start the application**
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   docker compose build
   docker compose run --rm web bin/rails db:create db:migrate
   docker compose up
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
docker compose run --rm web bin/rails test

# Run specific test file
docker compose run --rm web bin/rails test test/models/user_test.rb

# Run system tests
docker compose run --rm web bin/rails test:system
```

### Code Quality

This project uses RuboCop for code quality. To check your code:

```bash
# Run RuboCop
docker compose run --rm web bin/rubocop

# Auto-fix issues
docker compose run --rm web bin/rubocop -A
```

### Security Scanning

Run Brakeman to check for security vulnerabilities:

```bash
docker compose run --rm web bin/brakeman
```

### Database Migrations

```bash
# Create a new migration
docker compose run --rm web bin/rails generate migration AddFieldToModel field:type

# Run migrations
docker compose run --rm web bin/rails db:migrate

# Rollback last migration
docker compose run --rm web bin/rails db:rollback

# Check migration status
docker compose run --rm web bin/rails db:migrate:status
```

### Generating Resources

```bash
# Generate a model
docker compose run --rm web bin/rails generate model Article title:string body:text

# Generate a controller
docker compose run --rm web bin/rails generate controller Articles index show

# Generate a scaffold
docker compose run --rm web bin/rails generate scaffold Post title:string content:text
```

## Making Changes

1. Create a new branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test them locally

3. Run tests and linting
   ```bash
   docker compose run --rm web bin/rails test
   docker compose run --rm web bin/rubocop
   docker compose run --rm web bin/brakeman
   ```

4. Commit your changes with clear commit messages
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

5. Push your branch and create a pull request

## Code Style

- Follow the Ruby Style Guide
- Use RuboCop to ensure consistent code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## Pull Request Process

1. Ensure all tests pass
2. Update the README.md if you've made changes to setup or usage
3. Update CHANGELOG.md with notable changes
4. Request review from maintainers

## Getting Help

If you have questions or need help:
- Open an issue for bugs or feature requests
- Check existing issues and pull requests
- Review the Rails Guides: https://guides.rubyonrails.org/

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
