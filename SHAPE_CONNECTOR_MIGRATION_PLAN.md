# Shape & Connector Color Migration Plan

## Current State Analysis

### Problem
Shapes and connectors currently use the deprecated `getCanvasColors()` function, which returns static colors that don't adapt to theme changes. This prevents them from benefiting from the new reactive theme system.

### Files Using Deprecated Function

**Shape Renderers** (6 files):
- [src/entities/shape/ui/base-shape.ts:65](src/entities/shape/ui/base-shape.ts) - Used in `renderShapeText()`
- [src/entities/shape/ui/task-shape.ts:25](src/entities/shape/ui/task-shape.ts) - Used in `renderTask()`
- [src/entities/shape/ui/event-shape.ts](src/entities/shape/ui/event-shape.ts) - Likely similar usage
- [src/entities/shape/ui/gateway-shape.ts](src/entities/shape/ui/gateway-shape.ts) - Likely similar usage
- [src/entities/shape/ui/pool-shape.ts](src/entities/shape/ui/pool-shape.ts) - Likely similar usage
- [src/entities/shape/ui/rectangle-shape.ts](src/entities/shape/ui/rectangle-shape.ts) - Likely similar usage

**Connector Renderers**:
- [src/entities/connector/ui/connector-rendering-utils.ts:93,96](src/entities/connector/ui/connector-rendering-utils.ts) - Used in `getConnectorStrokeColor()`

**Rendering Systems**:
- [src/shared/lib/connections/connection-point-system.ts:490-493,544](src/shared/lib/connections/connection-point-system.ts) - Used in `renderConnectionPoints()` and `renderConnectorPreview()`
- [src/shared/lib/rendering/grid-system.ts:196](src/shared/lib/rendering/grid-system.ts) - Used in `render()`

### Root Cause
These renderers are **pure TypeScript functions** that execute outside React's component tree. They cannot use hooks like `useCanvasColors()` because hooks require a React rendering context.

## Migration Strategy

### Approach: Parameter Passing Pattern
Instead of fetching colors globally, pass `CanvasColors` as a parameter through the rendering pipeline.

**Color Flow**:
```
DiagramCanvas (React component)
  ↓ useCanvasColors() hook
  ↓ pass to useCanvasRendering()
  ↓ pass to renderCanvas()
  ↓ pass to shape/connector renderers
  ↓ use in actual rendering
```

**Pattern**:
```typescript
// Before (deprecated):
function renderShape(ctx, shape) {
  const colors = getCanvasColors(); // ❌ Global fetch
  ctx.fillStyle = colors.defaultShapeFill;
}

// After (correct):
function renderShape(ctx, shape, canvasColors) {
  ctx.fillStyle = canvasColors.defaultShapeFill; // ✅ Parameter
}
```

## Implementation Plan

### Phase 1: Update Shape Renderer Signatures

**1.1 Update `renderBaseShape()` in [base-shape.ts](src/entities/shape/ui/base-shape.ts)**
- Add `canvasColors: CanvasColors` parameter
- Pass to `renderShapeText()` call
- Update call sites in individual shape renderers

**1.2 Update `renderShapeText()` in [base-shape.ts](src/entities/shape/ui/base-shape.ts)**
- Add `canvasColors: CanvasColors` parameter
- Replace `getCanvasColors()` call (line 65) with parameter
- Update line 67: `const textColor = shape.textColor ?? canvasColors.shapeText;`

**1.3 Update Individual Shape Renderers**

Files to update:
- [src/entities/shape/ui/task-shape.ts](src/entities/shape/ui/task-shape.ts)
- [src/entities/shape/ui/event-shape.ts](src/entities/shape/ui/event-shape.ts)
- [src/entities/shape/ui/gateway-shape.ts](src/entities/shape/ui/gateway-shape.ts)
- [src/entities/shape/ui/pool-shape.ts](src/entities/shape/ui/pool-shape.ts)
- [src/entities/shape/ui/rectangle-shape.ts](src/entities/shape/ui/rectangle-shape.ts)

Changes for each:
- Add `canvasColors: CanvasColors` parameter to `render*()` function signature
- Replace `getCanvasColors()` call with parameter usage
- Example for task-shape.ts line 25:
  ```typescript
  // Before:
  export function renderTask(ctx, shape, isSelected, scale): void {
    const colors = getCanvasColors();
    const fillColor = taskShape.fillColor ?? colors.defaultShapeFill;

  // After:
  export function renderTask(ctx, shape, isSelected, scale, canvasColors): void {
    const fillColor = taskShape.fillColor ?? canvasColors.defaultShapeFill;
  ```

### Phase 2: Update Connector Renderers

**2.1 Update [connector-rendering-utils.ts](src/entities/connector/ui/connector-rendering-utils.ts)**

- Add `canvasColors: CanvasColors` parameter to `getConnectorStrokeColor()` function
- Replace `getCanvasColors()` call (line 93) with parameter
- Update function signature:
  ```typescript
  // Before:
  export function getConnectorStrokeColor(connector, isSelected): string {
    const colors = getCanvasColors();
    return isSelected ? colors.connectorStrokeSelected : ...

  // After:
  export function getConnectorStrokeColor(connector, isSelected, canvasColors): string {
    return isSelected ? canvasColors.connectorStrokeSelected : ...
  ```
- Update all call sites in connector-renderer.ts

### Phase 3: Update Rendering Systems

**3.1 Update [ConnectionPointSystem](src/shared/lib/connections/connection-point-system.ts) class**

Update these static methods:
- `renderConnectionPoints()` - Add `canvasColors` parameter, replace usage at lines 490-493
- `renderConnectorPreview()` - Add `canvasColors` parameter, replace usage at line 544

Changes:
```typescript
// Before:
static renderConnectionPoints(ctx, shape, options): void {
  const colors = getCanvasColors();
  ctx.fillStyle = isHighlighted ? colors.connectionPointHover : colors.connectionPoint;

// After:
static renderConnectionPoints(ctx, shape, options, canvasColors): void {
  ctx.fillStyle = isHighlighted ? canvasColors.connectionPointHover : canvasColors.connectionPoint;
```

Update call sites in [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts):
- Line 193-196: `ConnectionPointSystem.renderConnectionPoints(ctx, shape, {...}, canvasColors)`
- Line 202-208: `ConnectionPointSystem.renderConnectorPreview(ctx, ..., canvasColors)`

**3.2 Update [GridSystem](src/shared/lib/rendering/grid-system.ts) class**

- Add `canvasColors` to `GridRenderContext` interface in [types.ts](src/shared/lib/rendering/types.ts)
- Update `render()` method to use passed colors instead of calling `getCanvasColors()` (line 196)
- Change line 197: `ctx.strokeStyle = canvasColors.grid;`

Update call site in [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts):
- Line 127: Add `canvasColors` to GridSystem.render() context

### Phase 4: Update Canvas Renderer Orchestration

**4.1 Update [shape-renderer.ts](src/widgets/diagram-canvas/lib/shape-renderer.ts)**

- Add `canvasColors: CanvasColors` parameter to `renderShapes()` function
- Pass `canvasColors` to all shape render calls
- Update signature:
  ```typescript
  // Before:
  export function renderShapes(ctx, shapes, selectedIds, scale, selectionBox) {

  // After:
  export function renderShapes(ctx, shapes, selectedIds, scale, selectionBox, canvasColors) {
    // Pass canvasColors to individual shape renderers
  ```

Update call site in [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts):
- Line 151: `renderShapes(ctx, shapes, selectedEntityIds, transform.scale, selectionBox, canvasColors);`

**4.2 Update [connector-renderer.ts](src/widgets/diagram-canvas/lib/connector-renderer.ts)**

- Add `canvasColors: CanvasColors` parameter to `renderConnectors()` function
- Pass to connector utility functions (specifically `getConnectorStrokeColor()`)
- Update signature:
  ```typescript
  // Before:
  export function renderConnectors(ctx, connectors, shapes, selectedIds, scale) {

  // After:
  export function renderConnectors(ctx, connectors, shapes, selectedIds, scale, canvasColors) {
    // Pass canvasColors to getConnectorStrokeColor()
  ```

Update call site in [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts):
- Line 168: `renderConnectors(ctx, connectors, shapes, selectedEntityIds, transform.scale, canvasColors);`

**4.3 Verify [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts)**

This file already:
- ✅ Receives `canvasColors` in `CanvasRenderContext` (line 44)
- ✅ Extracts `canvasColors` from context (line 86)
- ✅ Uses `canvasColors.background` for fill (line 118)

Just needs to pass `canvasColors` to:
- GridSystem.render() - line 127
- renderShapes() - line 151
- renderConnectors() - line 168
- ConnectionPointSystem methods - lines 193, 202

### Phase 5: Remove Deprecated Function

**5.1 Delete from [canvas-config.ts](src/shared/config/canvas-config.ts)**

Remove:
- `CanvasColors` interface (lines 220-249)
- `getCanvasColors()` function (lines 261-292)
- Deprecation comment section (lines 212-214)

**5.2 Verify No Usage Remains**

Run these commands:
```bash
# Search for any remaining usage
grep -r "getCanvasColors" src/

# Should only find:
# - src/shared/hooks/use-canvas-colors.ts (the NEW hook - this is correct)

# Run TypeScript compilation to catch any missed call sites
npx tsc --noEmit
```

## File Changes Summary

### Files to Modify (14 total)

**Shape Renderers (6 files)**:
1. `src/entities/shape/ui/base-shape.ts` - Add color parameter to 2 functions
2. `src/entities/shape/ui/task-shape.ts` - Add color parameter
3. `src/entities/shape/ui/event-shape.ts` - Add color parameter
4. `src/entities/shape/ui/gateway-shape.ts` - Add color parameter
5. `src/entities/shape/ui/pool-shape.ts` - Add color parameter
6. `src/entities/shape/ui/rectangle-shape.ts` - Add color parameter

**Connector Renderers (1 file)**:
7. `src/entities/connector/ui/connector-rendering-utils.ts` - Add color parameter

**Rendering Systems (3 files)**:
8. `src/shared/lib/connections/connection-point-system.ts` - Add color parameter to 2 methods
9. `src/shared/lib/rendering/grid-system.ts` - Add color to render method
10. `src/shared/lib/rendering/types.ts` - Add canvasColors to GridRenderContext

**Canvas Renderers (3 files)**:
11. `src/widgets/diagram-canvas/lib/shape-renderer.ts` - Add color parameter, pass through
12. `src/widgets/diagram-canvas/lib/connector-renderer.ts` - Add color parameter, pass through
13. `src/widgets/diagram-canvas/lib/canvas-renderer.ts` - Pass colors to all renderers

**Configuration (1 file)**:
14. `src/shared/config/canvas-config.ts` - Delete deprecated function

### Files Already Updated ✅
- `src/widgets/diagram-canvas/ui/diagram-canvas.tsx` - Already uses `useCanvasColors()` hook
- `src/widgets/diagram-canvas/hooks/use-canvas-rendering.ts` - Already receives and passes colors
- `src/widgets/diagram-canvas/lib/canvas-renderer.ts` - Already receives colors in context (just needs to pass them)

## Benefits

1. **Reactive Theme Support** - All canvas elements (shapes, connectors, grid, connection points) update instantly when theme changes
2. **No Global State** - Clean parameter passing pattern, easier to test and reason about
3. **Type Safety** - TypeScript ensures colors are always provided, catching errors at compile time
4. **No Dead Code** - Removes deprecated backward compatibility function
5. **Consistent Architecture** - Matches the pattern already established in canvas-renderer.ts

## Testing Strategy

### After Each Phase
1. Run TypeScript compilation: `npx tsc --noEmit`
2. Fix any type errors before proceeding to next phase

### After Phase 5 (Complete)
Manually test all 4 theme combinations:
- **Standard Light**
- **Standard Dark**
- **Deuteranopia Light**
- **Deuteranopia Dark**

For each combination, verify:
- ✅ Shapes render with correct fill/stroke colors
- ✅ Shape text renders with correct color
- ✅ Connectors render with correct colors (default, selected, hover states)
- ✅ Connection points render with correct colors
- ✅ Grid renders with correct color
- ✅ Colors update instantly when toggling theme variant or color mode
- ✅ No console errors or warnings
- ✅ Shape/connector interactions still work correctly (selection, dragging, connecting)

### Regression Testing
- Create shapes and connectors
- Select/deselect entities
- Drag shapes and connectors
- Create new connectors via connection points
- Zoom in/out (verify grid adapts)
- Pan around canvas

## Rollback Plan

If issues arise during migration:

1. **Phase-by-Phase Rollback**: Each phase is independent and can be rolled back individually via git
2. **Temporary Restoration**: The deprecated `getCanvasColors()` function can be temporarily restored from git history if needed
3. **Incremental Testing**: Test after each phase to catch issues early before they cascade

## Success Criteria

✅ TypeScript compilation succeeds with no errors
✅ No references to `getCanvasColors()` exist except in use-canvas-colors.ts hook
✅ All 4 theme combinations render correctly
✅ Theme changes update canvas colors instantly
✅ All canvas interactions work as before
✅ No console errors or warnings during normal usage

---

**Migration Owner**: To be assigned
**Target Completion**: TBD
**Priority**: Medium (improves architecture, enables full theme system functionality)
