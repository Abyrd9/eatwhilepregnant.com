#!/bin/bash

# Set the path to the SQLite database file
DB_PATH="/data/sqlite.db"

# Check if the /data directory exists, create it if it doesn't
if [ ! -d "/data" ]; then
  mkdir -p "/data"
  echo "Created /data directory"
fi

# Check if the SQLite database file exists, create it if it doesn't
if [ ! -f "$DB_PATH" ]; then
  touch "$DB_PATH"
  echo "Created SQLite database file: $DB_PATH"
else
  echo "SQLite database file already exists: $DB_PATH"
fi

# Run the migration script to create the tables in the database
npm run db:migrate
npm run start