# Entities Layer

Business entities that represent core domain concepts (User, Product, Order, etc.)

## Structure

Each entity should have its own folder with segments:
- `ui/` - Components for displaying the entity
- `model/` - State management, types, interfaces
- `api/` - API calls related to this entity
- `lib/` - Entity-specific utilities

Example:
```
entities/
  user/
    ui/
      user-card.tsx
      user-avatar.tsx
    model/
      types.ts
      schema.ts
    api/
      get-user.ts
      update-user.ts
    lib/
      format-user-name.ts
```

## Rules

- Can import from: `shared`
- Cannot import from: `features`, `widgets`, `views`, `app`
- Focus on displaying and managing single entities
- NO cross-entity dependencies
