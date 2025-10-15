.PHONY: help build up down restart logs shell console test clean db-setup db-migrate db-reset rubocop brakeman

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images
	docker compose build

up: ## Start all services
	docker compose up

up-d: ## Start all services in detached mode
	docker compose up -d

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View logs from all services
	docker compose logs -f

shell: ## Open a bash shell in the web container
	docker compose exec web bash

console: ## Open Rails console
	docker compose run --rm web bin/rails console

test: ## Run tests
	docker compose run --rm web bin/rails test

test-system: ## Run system tests
	docker compose run --rm web bin/rails test:system

clean: ## Stop services and remove volumes
	docker compose down -v

db-setup: ## Create and migrate database
	docker compose run --rm web bin/rails db:create db:migrate

db-migrate: ## Run database migrations
	docker compose run --rm web bin/rails db:migrate

db-reset: ## Reset database (drop, create, migrate, seed)
	docker compose run --rm web bin/rails db:reset

db-seed: ## Seed database
	docker compose run --rm web bin/rails db:seed

rubocop: ## Run RuboCop linter
	docker compose run --rm web bin/rubocop

rubocop-fix: ## Run RuboCop with auto-fix
	docker compose run --rm web bin/rubocop -A

brakeman: ## Run Brakeman security scanner
	docker compose run --rm web bin/brakeman

bundle-install: ## Install gems
	docker compose run --rm web bundle install
	docker compose restart web

rails-generate: ## Generate Rails resource (use ARGS="model User name:string")
	docker compose run --rm web bin/rails generate $(ARGS)

rails-destroy: ## Destroy Rails resource (use ARGS="model User")
	docker compose run --rm web bin/rails destroy $(ARGS)
