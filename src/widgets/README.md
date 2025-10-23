# Widgets Layer

Compositional blocks that combine features and entities (Header, Sidebar, ProductCard, etc.)

## Structure

Each widget should have its own folder with segments:
- `ui/` - Widget UI components
- `model/` - Widget-specific state (if needed)
- `lib/` - Widget-specific utilities

Example:
```
widgets/
  header/
    ui/
      header.tsx
      nav-menu.tsx
    model/
      use-menu-state.ts
```

## Rules

- Can import from: `shared`, `entities`, `features`
- Cannot import from: `views`, `app`
- Compose multiple features/entities together
- Reusable across different pages
