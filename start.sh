#!/bin/bash

# Quick start script for Rails development with Docker

set -e

echo "🚀 Starting Pilotts Rails application with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose V2 is not available."
    echo "Please install Docker Compose V2 or use 'docker-compose' instead."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Build the containers
echo "📦 Building Docker containers..."
docker compose build

echo ""
echo "🗄️  Setting up the database..."
docker compose run --rm web bin/rails db:create db:migrate

echo ""
echo "✨ Starting the application..."
echo ""
echo "The Rails server will be available at: http://localhost:3000"
echo "PostgreSQL will be available at: localhost:5432"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start the services
docker compose up
