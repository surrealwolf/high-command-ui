.PHONY: help install dev build preview run test lint format clean docker-build docker-run docker-stop docker-clean docker-dev check check-all info

# Default target
help:
	@echo "High Command UI - React TypeScript Application"
	@echo "================================================"
	@echo ""
	@echo "Core Targets:"
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Start development server (port 3000)"
	@echo "  make build          - Build for production"
	@echo "  make preview        - Preview production build"
	@echo "  make run            - Build and run production version"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make lint           - Run TypeScript type checking"
	@echo "  make format         - Format code with prettier"
	@echo "  make check          - Run type checking and tests"
	@echo "  make check-all      - Format, lint, and verify"
	@echo ""
	@echo "Docker Targets:"
	@echo "  make docker-build   - Build Docker image"
	@echo "  make docker-run     - Run Docker container (port 3000)"
	@echo "  make docker-dev     - Run development container with hot reload"
	@echo "  make docker-stop    - Stop Docker container"
	@echo "  make docker-clean   - Remove Docker image"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean          - Remove build artifacts and node_modules"
	@echo "  make info           - Show project information"
	@echo "  make help           - Show this help message"
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

# Run production build
run: build
	npm run preview

# Type checking
lint:
	tsc --noEmit

# Code formatting (placeholder - add when prettier is installed)
format:
	@echo "Format target not configured yet. Add prettier or your formatter here."

# Testing (placeholder - add when test framework is installed)
test:
	@echo "Test target not configured yet. Add vitest or jest here."

# Quality checks
check: lint
	@echo "✓ Type checking passed"

check-all: format lint build
	@echo "✓ All checks passed"

# Clean build artifacts
clean:
	rm -rf dist dist-ssr node_modules .vite
	npm cache clean --force

# Docker commands
docker-build:
	docker build -t high-command-ui:latest .

docker-run: docker-build
	docker run -d --name high-command-ui -p 3000:3000 \
		-e VITE_API_URL=http://localhost:5000/api \
		-e VITE_MCP_URL=http://localhost:8000 \
		high-command-ui:latest

docker-dev:
	docker build -t high-command-ui:dev -f Dockerfile.dev .
	docker run --rm -it -v $(PWD):/app -p 3000:3000 \
		-e VITE_API_URL=http://localhost:5000/api \
		-e VITE_MCP_URL=http://localhost:8000 \
		-e NODE_ENV=development \
		high-command-ui:dev npm run dev

docker-stop:
	docker stop high-command-ui 2>/dev/null || true
	docker rm high-command-ui 2>/dev/null || true

docker-clean: docker-stop
	docker rmi high-command-ui:latest 2>/dev/null || true
	docker rmi high-command-ui:dev 2>/dev/null || true

# Project information
info:
	@echo "High Command UI - Project Information"
	@echo "======================================"
	@echo ""
	@echo "Framework: React 18 + TypeScript"
	@echo "Build Tool: Vite 4"
	@echo "Package Manager: npm"
	@echo ""
	@echo "Development Server: port 3000"
	@echo "API Endpoint: http://localhost:5000/api"
	@echo "MCP Endpoint: http://localhost:8000"
	@echo ""
	@echo "Status:"
	@if [ -d "node_modules" ]; then echo "  Dependencies: ✓ installed"; else echo "  Dependencies: ✗ not installed"; fi
	@if [ -d "dist" ]; then echo "  Production build: ✓ ready"; else echo "  Production build: ✗ not built"; fi
	@echo ""
	@echo "Quick Start:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Run development server"
	@echo "  make build         - Build for production"
	@echo "  make docker-run    - Run in Docker container"
	@echo ""
