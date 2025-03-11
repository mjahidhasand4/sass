# Prisma-related commands
# Usage: just <command>

# Default recipe to run when just is called without arguments
default:
    @just --list

# Initialize Prisma in the project
init:
    pnpm dlx prisma init

# Generate Prisma client
generate:
    pnpm dlx prisma generate

# Format the schema.prisma file
format:
    pnpm dlx prisma format

# Create a new migration
migrate name="":
    pnpm dlx prisma migrate dev --name "{{name}}"

# Apply pending migrations to the database
migrate-deploy:
    pnpm dlx prisma migrate deploy

# Reset the database (drops all tables and applies all migrations)
db-reset:
    pnpm dlx prisma migrate reset --force

# Push schema changes directly to the database without migrations
db-push:
    pnpm dlx prisma db push

# Pull the database schema into the Prisma schema
db-pull:
    pnpm dlx prisma db pull

# Open Prisma Studio to view and edit data
studio:
    pnpm dlx prisma studio

# Validate the Prisma schema
validate:
    pnpm dlx prisma validate

# Seed the database
seed:
    pnpm dlx prisma db seed

# Show database migrations status
migrations-status:
    pnpm dlx prisma migrate status

# Create a new migration without applying it
migrate-create name="":
    pnpm dlx prisma migrate dev --create-only --name "{{name}}"

# Run all recipes in development mode
dev: generate migrate-deploy

# Deploy to production
deploy: generate migrate-deploy
