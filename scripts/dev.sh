#!/bin/bash

set -euo pipefail

echo "Starting Redis..."
docker compose up -d redis

echo "Installing Bun dependencies..."
bun install --cwd ./web

echo "Starting Bun dev server..."
bun run --cwd ./web dev
