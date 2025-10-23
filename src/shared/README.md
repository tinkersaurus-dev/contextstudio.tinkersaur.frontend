# Shared Layer

The shared layer contains reusable code that can be used across all other layers.

## Structure

- `ui/` - Reusable UI components (buttons, inputs, etc.)
- `lib/` - Utility functions and helpers
- `api/` - API clients and HTTP configurations
- `config/` - Application configuration and constants
- `types/` - Shared TypeScript types and interfaces

## Rules

- NO business logic
- NO dependencies on other FSD layers
- Only generic, reusable code
- Import directly from specific files (no barrel exports)
