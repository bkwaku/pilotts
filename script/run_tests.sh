#!/bin/bash

# Setup test database and run RSpec tests

set -e

echo "🔧 Setting up test database..."

# Start database service if not running
docker compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Drop and recreate test database to avoid environment mismatch
echo "📦 Setting up test database..."
docker compose run --rm web bin/rails db:drop RAILS_ENV=test 2>/dev/null || true
docker compose run --rm web bin/rails db:create RAILS_ENV=test

echo "🔄 Running migrations..."
docker compose run --rm web bin/rails db:migrate RAILS_ENV=test

echo "✅ Database ready!"
echo ""
echo "🧪 Running tests..."
docker compose run --rm web bundle exec rspec

echo ""
echo "✨ Done!"
