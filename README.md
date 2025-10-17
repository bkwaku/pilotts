# Pilotts - Open Source Personal Blog Platform

**An open source alternative to Medium for personal blogging.**

Pilotts is a modern, self-hosted personal blog platform built with Ruby on Rails 8. It provides a clean, minimalist interface for writing and sharing your thoughts, stories, and insights without the constraints of centralized platforms.

## Why Pilotts?

- **Own Your Content**: Complete control over your writing and data
- **Privacy First**: No tracking, no ads, no algorithmic timeline
- **Clean Writing Experience**: Distraction-free editor with rich text formatting
- **Customizable**: Configure your blog name, bio, and social links
- **Self-Hosted**: Deploy on your own infrastructure
- **Open Source**: MIT licensed, modify and extend as you wish

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

Visit http://localhost:3000 to see your blog running! 

**What you'll get:**
- A clean, responsive blog interface at the root URL
- Admin dashboard at `/admin` (create account on first visit)
- Settings page to customize your blog name and bio
- Rich text editor for writing articles

## Tech Stack

- **Backend**: Ruby 3.2.3 with Rails 8.0.3
- **Database**: PostgreSQL 16 for reliable data storage
- **Frontend**: Modern HTML/CSS with Turbo and Stimulus (Hotwire)
- **Styling**: Custom CSS with Inter font family for clean typography
- **Assets**: Propshaft for efficient asset management
- **Containerization**: Docker and Docker Compose for easy deployment

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

## Testing

Pilotts uses **RSpec** for testing with comprehensive test coverage.

### Running Tests

```bash
# Run all tests
docker compose run --rm web bundle exec rspec

# Or use Make commands
make rspec              # Run all tests
make rspec-verbose      # Detailed output
make rspec-coverage     # With coverage report

# Run specific tests
docker compose run --rm web bundle exec rspec spec/models
docker compose run --rm web bundle exec rspec spec/models/article_spec.rb
```

### Test Coverage

View coverage report after running tests:
```bash
open coverage/index.html
```

**Current Test Suite:**
- ✅ Model tests (User, Article, Setting, Session)
- ✅ Controller tests (Admin::Articles, Articles, Home)
- ✅ Service object tests (ExcerptGeneration, ReadingTimeCalculator)
- ✅ Mailer tests (TestMailer)
- ✅ Factory definitions with FactoryBot
- ✅ Authentication helpers

📖 **Detailed testing guide**: See [docs/TESTING.md](docs/TESTING.md) for writing and running tests.

## Code Quality & Linting

Pilotts uses **RuboCop** with the [rubocop-rails-omakase](https://github.com/rails/rubocop-rails-omakase) configuration for maintaining consistent Ruby code style. Omakase is the default Rails style guide that comes with Rails 8.

### Running RuboCop

```bash
# Run RuboCop on all files
docker compose run --rm web bundle exec rubocop

# Auto-correct safe offenses
docker compose run --rm web bundle exec rubocop -a

# Auto-correct all offenses (including unsafe)
docker compose run --rm web bundle exec rubocop -A

# Run on specific files or directories
docker compose run --rm web bundle exec rubocop app/models
docker compose run --rm web bundle exec rubocop app/controllers/articles_controller.rb
```

### Using Make Commands

```bash
make rubocop            # Run RuboCop
make rubocop-fix        # Auto-fix offenses
```

### Adding Frozen String Literals

All Ruby files should have `# frozen_string_literal: true` at the top. To add them automatically:

```bash
# Using RuboCop auto-correct (recommended)
docker compose run --rm web bundle exec rubocop -A

# Or using the provided script
docker compose exec web ./script/add_frozen_string_literal.sh
```

📖 **More details**: See [docs/FROZEN_STRING_LITERALS.md](docs/FROZEN_STRING_LITERALS.md) for more information.

### RuboCop Configuration

The project uses **rubocop-rails-omakase** as the base configuration, which includes:
- Rails best practices
- Modern Ruby style conventions  
- Automatic code formatting rules

You can override or add custom rules in `.rubocop.yml`. The Omakase configuration provides sensible defaults that work well for most Rails applications.

📖 **About Omakase**: [rubocop-rails-omakase on GitHub](https://github.com/rails/rubocop-rails-omakase)

## Email Configuration

Pilotts includes built-in email support with easy configuration through environment variables.

### Local Development (Mailcatcher)
Emails are automatically captured by Mailcatcher in development:
- **Web Interface**: http://localhost:1080
- **SMTP Port**: 1025 (already configured)
- All emails appear in the web interface - no additional setup needed!

### Testing Email
```bash
# Open Rails console
docker compose exec web bin/rails console

# Send a test email
TestMailer.test_email('test@example.com').deliver_now

# Check http://localhost:1080 to see the email
```

### Production Setup
Configure SMTP via environment variables in your `.env` file:

```bash
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USER_NAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_DOMAIN=yourdomain.com
MAILER_FROM_EMAIL=noreply@yourdomain.com
```

📖 **Detailed guide**: See [docs/SMTP_SETUP.md](docs/SMTP_SETUP.md) for complete configuration options and provider-specific instructions.

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

## Contributing

Pilotts is an open source project and we welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help makes Pilotts better for everyone.

### Ways to Contribute
- 🐛 **Bug Reports**: Found an issue? Open a GitHub issue
- 💡 **Feature Requests**: Have an idea? We'd love to hear it
- 🔧 **Code Contributions**: Submit pull requests for fixes and features
- 📚 **Documentation**: Help improve guides and documentation
- 🎨 **Design**: Contribute to UI/UX improvements

### Development Setup
Follow the Quick Start guide above to get a local development environment running.

## Roadmap

Future enhancements planned for Pilotts:
- 📊 Advanced analytics and reader insights
- 🔍 Enhanced search and filtering
- 📱 Progressive Web App (PWA) support
- 🌐 Multi-language support
- 📧 Email newsletter integration
- 🔗 Webmention and IndieWeb support
- 📚 Content categories and tags

## Additional Resources

### Development & Deployment
- [Ruby on Rails Guides](https://guides.rubyonrails.org/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Kamal Deployment Guide](https://kamal-deploy.org/)

## License

This project is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
