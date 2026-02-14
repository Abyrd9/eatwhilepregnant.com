SHELL := /bin/bash

.PHONY: list
list:
	@echo "Available commands:"
	@awk -F':' '/^[a-zA-Z0-9-]+:/ {print $$1}' $(MAKEFILE_LIST) | sort | awk '{print "  " $$0}'

.PHONY: dev
dev:
	bash ./scripts/dev.sh

.PHONY: redis-up
redis-up:
	docker compose up -d redis

.PHONY: redis-down
redis-down:
	docker compose down

.PHONY: web-install
web-install:
	cd ./web && bun install

.PHONY: web-dev
web-dev:
	cd ./web && bun run dev

.PHONY: web-build
web-build:
	cd ./web && bun run build

.PHONY: web-start
web-start:
	cd ./web && bun run start

.PHONY: web-typecheck
web-typecheck:
	cd ./web && bun run typecheck

%:
	@:
