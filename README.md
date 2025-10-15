# Pilotts - Ruby on Rails 8 Application

A modern Ruby on Rails 8 application with PostgreSQL database, fully containerized with Docker for easy development and deployment.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose V2 (included with Docker Desktop or Docker Engine 20.10+)

**Note:** This guide uses the `docker compose` command (Docker Compose V2). If you're using the older standalone version, replace `docker compose` with `docker-compose` (with hyphen) in all commands.

## Quick Start

Get up and running in under 5 minutes:

```bash
# Clone the repository
git clone <repository-url>
cd pilotts

# Run the quick start script
./start.sh
```

Or manually:

```bash
docker compose build
docker compose run --rm web bin/rails db:create db:migrate
docker compose up
```

**Using Make (Optional):**
If you have `make` installed, you can use convenient shortcuts:

```bash
make build      # Build Docker images
make db-setup   # Set up database
make up         # Start application
```

See `make help` for all available commands.

Visit http://localhost:3000 to see your app running!

## Tech Stack

- **Ruby**: 3.2.3
- **Rails**: 8.0.3
- **Database**: PostgreSQL 16
- **Asset Pipeline**: Propshaft
- **JavaScript**: Importmap with Turbo and Stimulus (Hotwire)

## Getting Started with Docker

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pilotts
```

### 2. Environment Configuration (Optional)

The application comes with sensible defaults in `docker compose.yml`. If you want to customize settings, create a `.env` file:

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

### 3. Build Docker Containers

Build the Docker images for the first time:

```bash
docker compose build
```

### 4. Set Up the Database

Create and migrate the database:

```bash
docker compose run --rm web bin/rails db:create db:migrate
```

### 5. Start the Application

Start all services (web server and database):

```bash
docker compose up
```

The application will be available at http://localhost:3000

To run in detached mode (background):

```bash
docker compose up -d
```

## Common Docker Commands

### Running Rails Commands

Run any Rails command inside the container:

```bash
# Generate a model
docker compose run --rm web bin/rails generate model Article title:string body:text

# Run migrations
docker compose run --rm web bin/rails db:migrate

# Rollback migration
docker compose run --rm web bin/rails db:rollback

# Run seeds
docker compose run --rm web bin/rails db:seed

# Open Rails console
docker compose run --rm web bin/rails console

# Run tests
docker compose run --rm web bin/rails test

# Run a specific test file
docker compose run --rm web bin/rails test test/models/article_test.rb
```

### Accessing the Rails Console

Enter the Rails console for debugging and interacting with your application:

```bash
docker compose run --rm web bin/rails console
```

### Accessing the Shell

Enter the container shell (bash):

```bash
docker compose exec web bash
```

Or if the containers aren't running:

```bash
docker compose run --rm web bash
```

### Database Management

```bash
# Access PostgreSQL console
docker compose exec db psql -U postgres -d pilotts_development

# Create database
docker compose run --rm web bin/rails db:create

# Drop database
docker compose run --rm web bin/rails db:drop

# Reset database (drop, create, migrate, seed)
docker compose run --rm web bin/rails db:reset

# Check database migration status
docker compose run --rm web bin/rails db:migrate:status
```

### Managing Containers

```bash
# View running containers
docker compose ps

# View logs
docker compose logs

# View logs for specific service
docker compose logs web
docker compose logs db

# Follow logs in real-time
docker compose logs -f web

# Stop all containers
docker compose down

# Stop and remove all containers, networks, and volumes
docker compose down -v

# Rebuild containers (useful after Gemfile changes)
docker compose build --no-cache
docker compose up
```

### Installing New Gems

After adding a gem to the Gemfile:

```bash
# Rebuild the web container
docker compose build web

# Restart the services
docker compose up
```

Or run bundle install directly:

```bash
docker compose run --rm web bundle install
docker compose restart web
```

## Development Workflow

1. **Make code changes** - Files are mounted as volumes, so changes appear immediately
2. **Restart server if needed** - Most changes are auto-reloaded, but some require restart:
   ```bash
   docker compose restart web
   ```
3. **Run tests** - Always test your changes:
   ```bash
   docker compose run --rm web bin/rails test
   ```

## Project Structure

```
pilotts/
├── app/                    # Application code
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── views/              # View templates
│   ├── jobs/               # Background jobs
│   ├── mailers/            # Email templates
│   └── assets/             # CSS, images
├── bin/                    # Executable scripts
├── config/                 # Application configuration
│   ├── database.yml        # Database configuration
│   ├── routes.rb           # URL routing
│   └── environments/       # Environment-specific settings
├── db/                     # Database files
│   ├── migrate/            # Database migrations
│   └── seeds.rb            # Seed data
├── test/                   # Test files
├── docker compose.yml      # Docker services configuration
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
└── README.md               # This file
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5432 is already in use:

```bash
# Stop the conflicting service or change ports in docker compose.yml
# For example, change "3000:3000" to "3001:3000"
```

### Permission Errors

If you encounter permission errors:

```bash
# On Linux, you might need to fix ownership
sudo chown -R $USER:$USER .
```

### Container Won't Start

```bash
# Remove all containers and volumes, then rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Database Connection Errors

```bash
# Wait for PostgreSQL to be ready
docker compose up -d db
sleep 10
docker compose run --rm web bin/rails db:create db:migrate
docker compose up
```

## Production Deployment

This repository includes a production-ready Dockerfile. To build for production:

```bash
docker build -t pilotts .
docker run -d -p 80:80 \
  -e RAILS_MASTER_KEY=<your-master-key> \
  -e DATABASE_URL=<your-database-url> \
  --name pilotts pilotts
```

For production deployment, consider using [Kamal](https://kamal-deploy.org/) (included in the project) or other container orchestration platforms.

## Additional Resources

- [Ruby on Rails Guides](https://guides.rubyonrails.org/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

This project is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
