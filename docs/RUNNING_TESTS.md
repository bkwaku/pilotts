# Running RSpec Tests

## Quick Start

Since Docker commands aren't available directly in the terminal, use the Makefile commands or run them through your Docker Desktop.

### Option 1: Using Make (Recommended)

```bash
# Add to Makefile, then run:
make test-setup    # Setup test database
make rspec         # Run tests
```

### Option 2: Manual Commands

Run these commands one by one:

```bash
# 1. Ensure database is running
docker compose up -d db

# 2. Drop and recreate test database (fixes environment mismatch)
docker compose run --rm web bin/rails db:drop RAILS_ENV=test
docker compose run --rm web bin/rails db:create RAILS_ENV=test

# 3. Run migrations
docker compose run --rm web bin/rails db:migrate RAILS_ENV=test

# 4. Run tests
docker compose run --rm web bundle exec rspec
```

### Option 3: One-liner

```bash
docker compose up -d db && \
docker compose run --rm web bin/rails db:drop RAILS_ENV=test && \
docker compose run --rm web bin/rails db:create RAILS_ENV=test && \
docker compose run --rm web bin/rails db:migrate RAILS_ENV=test && \
docker compose run --rm web bundle exec rspec
```

## What Was Fixed

1. **Shoulda::Matchers Error**: Added proper `require 'shoulda/matchers'` with error handling
2. **Database Environment Mismatch**: The test database needs to be dropped and recreated
3. **Rails Helper**: Added conditional checks for gems that might not be loaded

## Next Steps

1. Run the database setup commands above
2. Run the tests with `docker compose run --rm web bundle exec rspec`
3. Tests should now pass!

## Troubleshooting

### If you still get "uninitialized constant Shoulda"
The gems need to be installed. Run:
```bash
docker compose run --rm web bundle install
```

### If you get database errors
Make sure the database container is running:
```bash
docker compose ps
docker compose up -d db
```

### If migrations fail
Check if there are pending migrations:
```bash
docker compose run --rm web bin/rails db:migrate:status RAILS_ENV=test
```
