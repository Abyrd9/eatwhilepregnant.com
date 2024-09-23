SHELL := /bin/bash

# Scripts
.PHONY: dev
dev:
	bash ./scripts/dev.sh

# List all available commands
.PHONY: list
list:
	@echo "Available commands:"
	@awk -F':' '/^[a-zA-Z0-9-]+:/ {print $$1}' $(MAKEFILE_LIST) | sort | awk '{print "  " $$0}'

# Frontend
.PHONY: web-dev
web-dev:
	@echo "Starting web:dev..."
	cd ./web && npm run dev 

.PHONY: web-install
web-install:
	@echo "Installing npm dependencies..."
	cd ./web && npm install $(filter-out $@,$(MAKECMDGOALS))

.PHONY: web-dev-install
web-dev-install:
	@echo "Installing npm dev dependencies..."
	cd ./web && npm install -D $(filter-out $@,$(MAKECMDGOALS))

.PHONY: web-remove
web-remove:
	@echo "Removing npm dependencies..."
	cd ./web && npm uninstall $(filter-out $@,$(MAKECMDGOALS))

.PHONY: web-build
web-build:
	@echo "Building web:dev..."
	cd ./web && npm run build

.PHONY: web-clean
web-clean:
	@echo "Cleaning web:dev..."
	cd ./web && rm -rf node_modules

.PHONY: web-outdated
web-outdated:
	@echo "Checking for outdated npm dependencies..."
	cd ./web && npx npm-check-updates -i

.PHONY: web-ts
web-ts:
	@echo "Checking for typescript errors..."
	cd ./web && npx tsc

# Database
.PHONY: db-start
db-start:
	@echo "Starting local turso db..."
	turso dev

.PHONY: db-generate
db-generate:
	@echo "Generating migrations..."
	cd ./web && npm run db:generate

.PHONY: db-migrate
db-migrate:
	@echo "Migrating database..."
	cd ./web && npm run db:migrate

.PHONY: db-studio
db-studio:
	@echo "Starting db:studio..."
	cd ./web && npm run db:studio

.PHONY: db-drop
db-drop:
	@echo "Dropping database..."
	cd ./web && npm run db:drop

.PHONY: db-clear
db-clear:
	@echo "Clearing database..."
	cd ./web/sqlite && rm -rf sqlite.db*

%:
	@: