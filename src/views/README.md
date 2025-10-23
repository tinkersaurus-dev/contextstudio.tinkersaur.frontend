# Views Layer

Page-level compositions used by Next.js app router pages.

## Purpose

Views are NOT routes - they are the page compositions that routes import and render.
The actual routing is handled by the Next.js `app/` folder.

## Structure

Each view corresponds to a page and composes widgets, features, and entities:

```
views/
  home/
    home-view.tsx
  dashboard/
    dashboard-view.tsx
  profile/
    profile-view.tsx
```

## Usage in Next.js

```tsx
// app/page.tsx
import { HomeView } from '@/views/home/home-view';

export default function Page() {
  return <HomeView />;
}
```

## Rules

- Can import from: `shared`, `entities`, `features`, `widgets`
- Cannot import from: `app`
- One view per page/route
- Contains page-specific layouts and compositions
- NO business logic - delegate to features/entities
