.PHONY: help install dev build preview clean docker-build docker-run docker-stop lint

# Default target
help:
	@echo "High Command UI - Available Commands"
	@echo "===================================="
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Start development server (port 3000)"
	@echo "  make build          - Build for production"
	@echo "  make preview        - Preview production build"
	@echo "  make clean          - Remove build artifacts and node_modules"
	@echo "  make docker-build   - Build Docker image"
	@echo "  make docker-run     - Run Docker container (port 3000)"
	@echo "  make docker-stop    - Stop Docker container"
	@echo "  make docker-clean   - Remove Docker image"
	@echo ""

# Install dependencies
install:
	npm install

# Development server
dev: install
	npm run dev

# Production build
build: install
	npm run build

# Preview production build
preview: build
	npm run preview

# Clean build artifacts
clean:
	rm -rf dist dist-ssr node_modules
	npm cache clean --force

# Docker commands
docker-build:
	docker build -t high-command-ui:latest .

docker-run: docker-build
	docker run -d --name high-command-ui -p 3000:3000 -e API_URL=http://localhost:3001/api high-command-ui:latest

docker-stop:
	docker stop high-command-ui && docker rm high-command-ui

docker-clean: docker-stop
	docker rmi high-command-ui:latest

# Development with Docker
docker-dev:
	docker build -t high-command-ui:dev -f Dockerfile.dev .
	docker run --rm -it -v $(PWD):/app -p 3000:3000 -e NODE_ENV=development high-command-ui:dev npm run dev

# Build info
info:
	@echo "Project: High Command UI"
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@if [ -d "node_modules" ]; then echo "Dependencies: installed"; else echo "Dependencies: not installed"; fi
	@if [ -d "dist" ]; then echo "Production build: ready"; else echo "Production build: not built"; fi
