# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server implementation using hexagonal architecture patterns, with a Go backend and JavaScript/TypeScript frontend.

## Development Setup

### Backend (Go)
- Uses `air` for hot reloading during development
- Run backend development server: `air`
- The backend implements hexagonal architecture with clear separation between:
  - **Adapters**: HTTP handlers, database adapters, external service clients
  - **Ports**: Interfaces defining contracts between layers
  - **Domain**: Core business logic and entities
  - **Application**: Use cases and application services

### Frontend
- Uses Vite for development and building
- Run frontend development server: `npm run dev`
- Hot reloading is configured and working

### Development Workflow
- Both servers run concurrently during development
- Backend changes are automatically reloaded via `air`
- Frontend changes are automatically reloaded via Vite
- Commit frequently to maintain development history and enable easy rollbacks

## Architecture Patterns

### Hexagonal Architecture
The codebase follows hexagonal (ports and adapters) architecture:
- **Domain Layer**: Core business logic, entities, and value objects
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Database, external APIs, file system
- **Presentation Layer**: HTTP handlers, CLI commands, web UI

### MCP Protocol Implementation
- Implements Model Context Protocol for AI model integration
- Server capabilities are defined in the MCP specification
- Client-server communication follows MCP message patterns

## File Management
- Never delete files or folders - move them to `~/.tmp` instead
- All files should end with a single newline