# Theme System Documentation

## Overview

The application now uses a comprehensive theming system that centralizes all color configuration. This makes it easy to create new themes and maintain consistent styling across the entire application.

## Architecture

### Theme Configuration Files

- **`types.ts`** - TypeScript interfaces defining the theme structure
- **`default.theme.ts`** - The default blue theme (original colors)
- **`theme-registry.ts`** - Theme management and selection logic
- **`index.ts`** - Public exports

### Theme Structure

Each theme defines colors for:

1. **Color Palettes** (50-950 scale):
   - `primary` - Main brand color
   - `secondary` - Accent/supporting color
   - `tertiary` - Additional accent color
   - `neutral` - Gray/neutral tones

2. **Canvas Colors**:
   - Background, grid, selection, shapes, connectors, connection points

3. **UI Semantic Tokens** (responsive light/dark):
   - Header, panel, sidebar, editor components

4. **Diagram-Specific Colors**:
   - BPMN shapes (task, event, gateway, pool)
   - Sequence diagram shapes (actor, lifeline, activation, note)
   - Data flow shapes (process, dataStore, entity, subprocess)

5. **Markdown Styling**:
   - Code blocks, blockquotes, links, tables, headings

6. **Status Colors** (info/success/warning/danger palettes)

## Creating a New Theme

### Step 1: Create Theme File

Create a new file in `src/app/themes/` (e.g., `green.theme.ts`):

```typescript
import type { ThemeConfig } from "./types";

export const greenTheme: ThemeConfig = {
  id: "green",
  name: "Forest Green",
  description: "Green-based theme with earthy tones",

  // Primary: Green
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Base green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  // Copy and customize secondary, tertiary, neutral, canvas, ui, diagrams, markdown, and status
  // from default.theme.ts, changing colors as needed
  // ...
};
```

### Step 2: Register Theme

Add your theme to `theme-registry.ts`:

```typescript
import { greenTheme } from "./green.theme";

const themes: ThemeRegistry = {
  default: defaultTheme,
  green: greenTheme, // Add here
};
```

### Step 3: Activate Theme

Set the environment variable:

```bash
NEXT_PUBLIC_THEME_ID=green
```

Or modify `getActiveTheme()` in `theme-registry.ts` for dynamic selection.

## Migration Status

### ✅ Completed

1. Theme system architecture and types
2. Default theme configuration
3. Theme registry and selection
4. Chakra UI integration ([theme.ts](../theme.ts))
5. Canvas configuration ([canvas-config.ts](../../shared/config/canvas-config.ts))
6. Connection point system
7. All toolsets (BPMN, Sequence, Data Flow)
8. Header component
9. Design sidebar components
10. Toolset popover

### ⚠️ Remaining Updates

The following files still reference hardcoded colors or old "brand" tokens and need to be updated to use the new theme system:

#### UI Components

1. **Document Editor** (`src/widgets/document-editor/ui/document-editor.tsx`)
   - Line 96: `borderColor="gray.200"` → `borderColor="secondary.200"`
   - Line 99: `bg="gray.50"` → `bg="secondary.50"`
   - Line 101: `color="gray.700"` → `color="secondary.700"`
   - Line 143: `bg="gray.100"` → `bg="editor.lineNumbers"`
   - Line 145: `borderColor="gray.300"` → `borderColor="editor.lineNumbersBorder"`
   - Line 151: `color="gray.600"` → `color="editor.lineNumbersText"`
   - Line 190: `color: 'var(--chakra-colors-brand-950)'` → `color: 'var(--chakra-colors-primary-950)'`
   - Inline CSS (lines 214-298): Replace all hardcoded hex colors with theme token references:
     - `#e5e7eb` → Use `activeTheme.markdown.headingBorder`
     - `#f3f4f6` → Use `activeTheme.markdown.code.bg`
     - `#6b7280` → Use `activeTheme.markdown.blockquote.text`
     - `#2563eb` → Use `activeTheme.markdown.link`

2. **Text Edit Overlay** (`src/widgets/text-edit-overlay/ui/text-edit-overlay.tsx`)
   - Line 66: `border: '1px solid #0066cc'` → `border: '1px solid ' + activeTheme.ui.editor.inputBorder.light`
   - Line 68: `background: 'white'` → `background: activeTheme.ui.editor.bg.light`

3. **Solution Management View** (`src/views/solution-management/solution-management-view.tsx`)
   - Replace all `gray.*` references with `secondary.*` or `neutral.*`
   - Add dark mode support using `_dark` props

4. **Solution Table** (`src/widgets/solution-management/ui/solution-table.tsx`)
   - Replace `blue.50` / `blue.950` with `status.info.50` / `status.info.950`
   - Replace `green.50` / `green.950` with `status.success.50` / `status.success.950`
   - Replace `yellow.50` / `yellow.950` with `status.warning.50` / `status.warning.950`
   - Replace `red` colorPalette with `danger`

5. **Design Studio Content Area** (`src/views/design-studio/ui/design-studio-content-area.tsx`)
   - Replace `white` with `sidebar.bg`
   - Replace `gray.*` references with semantic tokens

#### Shape Definitions

The following shape files use default colors from canvas config, but you may want to verify they're correctly inheriting from toolsets:

- `src/entities/shape/ui/task-shape.ts`
- `src/entities/shape/ui/start-event-shape.ts`
- `src/entities/shape/ui/end-event-shape.ts`
- `src/entities/shape/ui/gateway-shape.ts`
- `src/entities/shape/ui/pool-shape.ts`
- `src/entities/shape/ui/rectangle-shape.ts`
- `src/entities/shape/ui/base-shape.ts`

#### Global Styles

1. **globals.css** (`src/app/globals.css`)
   - CSS variables currently hardcoded
   - Should be generated from active theme

## Using Theme Colors in Code

### In Chakra Components

Use semantic token names:

```tsx
<Box bg="sidebar.bg" color="sidebar.text">
  <Text color="primary.500">Primary text</Text>
  <Button colorPalette="primary">Click me</Button>
</Box>
```

### In Canvas/Custom Rendering

Import and use the active theme directly:

```typescript
import { activeTheme } from '@/app/theme';

ctx.fillStyle = activeTheme.canvas.shapes.fill;
ctx.strokeStyle = activeTheme.canvas.connectors.default;
```

### In Toolset Configurations

```typescript
import { activeTheme } from '@/app/theme';

shapeConfig: {
  fillColor: activeTheme.diagrams.bpmn.task.fill,
  strokeColor: activeTheme.diagrams.bpmn.task.stroke,
}
```

## Theme Token Reference

### Chakra Semantic Tokens (Use in JSX)

- `primary.{50-950}` - Primary color palette
- `secondary.{50-950}` - Secondary color palette
- `tertiary.{50-950}` - Tertiary color palette
- `neutral.{50-950}` - Neutral/gray palette
- `header.bg` - Header background (responsive)
- `header.title` - Header title color (responsive)
- `header.nav` - Navigation link color (responsive)
- `header.nav.hover` - Navigation hover color (responsive)
- `panel.bg` - Panel background (responsive)
- `sidebar.bg` - Sidebar background (responsive)
- `sidebar.toolbar` - Sidebar toolbar background (responsive)
- `sidebar.text` - Sidebar text color (responsive)
- `editor.bg` - Editor background (responsive)
- `editor.text` - Editor text color (responsive)
- `editor.lineNumbers` - Line numbers background (responsive)
- `editor.lineNumbersText` - Line numbers text (responsive)
- `editor.lineNumbersBorder` - Line numbers border (responsive)
- `editor.inputBorder` - Text input border (responsive)

### Direct Theme Access (Use in TypeScript)

```typescript
import { activeTheme } from '@/app/theme';

activeTheme.canvas.background
activeTheme.canvas.grid.minor
activeTheme.canvas.selection.border
activeTheme.diagrams.bpmn.task.fill
activeTheme.markdown.code.bg
activeTheme.status.success.500
```

## Color Naming Conventions

- **50-950 Scale**: 50 is lightest, 950 is darkest, 500 is the base/default
- **Responsive Colors**: Include both `light` and `dark` variants
- **Semantic Names**: Use descriptive names (e.g., `header.nav.hover`) instead of generic names
- **Diagram Colors**: Follow pattern `diagrams.{type}.{shape}.{fill|stroke}`

## Tips for Theme Creation

1. **Start with Default**: Copy `default.theme.ts` as a starting point
2. **Use Color Tools**: Tools like [Coolors](https://coolors.co) or [Adobe Color](https://color.adobe.com) help create palettes
3. **Maintain Contrast**: Ensure text is readable against backgrounds (use WebAIM Contrast Checker)
4. **Test Both Modes**: Verify theme works in both light and dark modes
5. **Keep Consistency**: Use related shades from the same palette for cohesion

## Future Enhancements

- Runtime theme switching (currently requires rebuild)
- User-selectable themes (persist in localStorage)
- Theme preview/builder UI
- Auto-generate dark mode variants
- Theme import/export (JSON format)
- CSS variable generation for globals.css

## Questions?

- See `types.ts` for complete theme structure
- See `default.theme.ts` for reference implementation
- See existing components for usage examples
