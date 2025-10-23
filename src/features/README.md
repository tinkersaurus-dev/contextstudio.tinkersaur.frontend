# Features Layer

User interactions and business features (authentication, add-to-cart, like-post, etc.)

## Structure

Each feature should have its own folder with segments:
- `ui/` - Feature UI components
- `model/` - State management, actions, types
- `api/` - API calls for this feature
- `lib/` - Feature-specific utilities

Example:
```
features/
  auth/
    ui/
      login-form.tsx
      logout-button.tsx
    model/
      use-auth.ts
      types.ts
    api/
      login.ts
      logout.ts
```

## Rules

- Can import from: `shared`, `entities`
- Cannot import from: `widgets`, `views`, `app`
- Each feature is independent and isolated
- NO cross-feature dependencies
- Focus on user actions and interactions
