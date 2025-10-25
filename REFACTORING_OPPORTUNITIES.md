# Refactoring Opportunities

## Overview

This document outlines refactoring opportunities identified during code review of the src directory.

**Date:** 2025-10-24
**Status:** In Progress
**Total Files Reviewed:** 81 TypeScript files

---

## Architectural Strengths ✓

The codebase demonstrates excellent practices:
- **Feature-Sliced Design (FSD)** architecture with clean separation
- **Strong type safety** with discriminated unions
- **Well-implemented registry patterns** for shapes and connectors
- **Proper state management** with Zustand
- **Good separation of concerns** at the module level

---

## Refactoring Opportunities

### 1. Code Duplication (High Priority)

#### 1.1 Repeated Factory Pattern
**Location:** `entities/shape/lib/factories/` (all factory files)
**Issue:** Each factory function follows identical patterns:
```typescript
const position = calculatePosition(x, y, width, height, centered);
return {
  id: generateShapeId(),
  type: DiagramEntityType.Shape,
  shapeType: ShapeType.XYZ,
  position,
  dimensions: { width, height },
  fillColor,
  strokeColor,
  strokeWidth,
};
```

**Recommendation:**
```typescript
function createBaseShape<T extends BaseShape>(
  options: CreateShapeOptions,
  shapeType: ShapeType
): T {
  // Common logic
}
```

**Status:** ~~⬜ Not Started~~ **DEFERRED** - Shape complexity still evolving

---

#### 1.2 Selection State Management
**Location:** `widgets/diagram-canvas/model/canvas-store.ts` (lines 89-92, 130-133, 174-177)
**Issue:** Set mutation pattern repeated multiple times:
```typescript
const newSelectedIds = new Set(state.selectedEntityIds);
newSelectedIds.add/delete/has(...);
```

**Recommendation:**
```typescript
function copySetWithMutation(
  set: Set<string>,
  op: (s: Set<string>) => void
): Set<string> {
  const copy = new Set(set);
  op(copy);
  return copy;
}
```

**Status:** ~~⬜ Not Started~~ **REJECTED** - Pattern is clear and intentional

---

#### 1.3 Connector Rendering Color Logic
**Location:** All three connector renderers (`straight-connector.ts`, `curved-connector.ts`, `orthogonal-connector.ts`)
**Issue:** Identical selection color logic in each:
```typescript
const strokeColor = isSelected
  ? CANVAS_COLORS.connectorStrokeSelected
  : (connector.strokeColor ?? CANVAS_COLORS.connectorStroke);
```

**Recommendation:**
```typescript
function getConnectorStrokeColor(
  connector: Connector,
  isSelected: boolean
): string {
  return isSelected
    ? CANVAS_COLORS.connectorStrokeSelected
    : (connector.strokeColor ?? CANVAS_COLORS.connectorStroke);
}
```

**Status:** ✅ **COMPLETED** - 2025-10-24
**Details:** Created `getConnectorStrokeColor()` and `getConnectorStrokeWidth()` utility functions in [connector-rendering-utils.ts](src/entities/connector/ui/connector-rendering-utils.ts). Updated all three connector renderers to use these utilities.

---

#### 1.4 Connector Creation Code
**Location:** `connector-factory.ts` and `diagram-canvas.tsx`
**Issue:** Similar connector creation logic duplicated in two places:
- Factory's `createConnector()` function
- Direct creation in `diagram-canvas.tsx` when releasing connector drag

**Recommendation:** Ensure all creation goes through factory for single source of truth

**Status:** ✅ **ALREADY IMPLEMENTED**
**Details:** Verified that all connector creation in the codebase already goes through factory functions. [diagram-canvas.tsx:335](src/widgets/diagram-canvas/ui/diagram-canvas.tsx#L335) uses `createStraightConnector()` from the factory. No direct object creation found.

---

### 2. Long/Complex Functions (High Priority)

#### 2.1 DiagramCanvas Component - 443 Lines
**Location:** `widgets/diagram-canvas/ui/diagram-canvas.tsx`
**Issues:**
- Multiple responsibilities: mouse handling, connector creation, state management, rendering
- Deep nesting (7+ levels in some areas)
- 8+ useState hooks
- Mixed concerns: connection point detection, drag preview, rendering

**Current Structure:**
```typescript
<DiagramCanvas>
  - Mouse event setup (handleMouseDown, handleMouseMove, handleMouseUp)
  - Connector drag state (5 related useState calls)
  - Connection point hover (3 related useState calls)
  - Rendering logic
```

**Recommended Breakdown:**
```typescript
<DiagramCanvas>
  - <CanvasMouseInput> (extracts all mouse setup)
  - <ConnectorDragHandler> (handles connector creation flow)
  - <ConnectionPointOverlay> (handles connection points)
  - <CanvasRenderer> (pure rendering)
```

**Status:** ⬜ Not Started

---

#### 2.2 Canvas Store - 308 Lines
**Location:** `widgets/diagram-canvas/model/canvas-store.ts`
**Issues:**
- Hit detection logic mixed with state management
- `selectEntitiesInBox()` contains inline bounding box logic
- `getEntityAtPoint()` has complex connector hit detection

**Recommendation:**
Extract hit detection to separate module:
```typescript
// New file: canvas-hit-detection.ts
export function getEntityAtPoint(
  shapes: Shape[],
  connectors: Connector[],
  x: number,
  y: number
): DiagramEntity | null

export function selectEntitiesInBox(
  entities: DiagramEntity[],
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string[]
```

**Status:** ✅ **COMPLETED** - 2025-10-24
**Details:** Created [canvas-hit-detection.ts](src/widgets/diagram-canvas/lib/canvas-hit-detection.ts) module with:
- `getEntityAtPoint()` - Point-based hit detection for shapes and connectors
- `isPointInShape()` - Shape bounding box check
- `isPointOnConnector()` - Connector line proximity check
- `selectEntitiesInBox()` - Box selection logic
- `boxesIntersect()` - Utility for bounding box intersection

Refactored [canvas-store.ts](src/widgets/diagram-canvas/model/canvas-store.ts) to use the new module, reducing from 308 to 268 lines (40 lines removed). Hit detection now properly separated from state management.

---

#### 2.3 Mouse Input Setup - 211 Lines
**Location:** `widgets/diagram-canvas/lib/mouse-input.ts`
**Issues:**
- Long handler functions (50+ lines each)
- State management logic interleaved with event handling
- Connection point checking logic duplicated

**Recommendation:** Extract callback builders and simplify event listener setup

**Status:** ✅ **COMPLETED** - 2025-10-24
**Details:** Refactored [mouse-input.ts](src/widgets/diagram-canvas/lib/mouse-input.ts) to improve modularity and maintainability:
- Extracted `createMouseStates()` - Separates state initialization from setup logic
- Created builder functions: `buildWheelHandler()`, `buildMouseDownHandler()`, `buildMouseMoveHandler()`, `buildMouseUpHandler()`, `buildContextMenuHandler()`
- Extracted `shouldSkipClick()` - Consolidates connection point checking logic, eliminating duplication
- Extracted `handleLeftMouseDown()` - Separates left-click logic for better readability
- Created `attachEventListeners()` and `createCleanupFunction()` - Centralizes listener management
- Main `setupMouseInput()` function is now clean and declarative (29 lines vs 169 lines)
- Improved testability with smaller, focused functions
- File grew from 211 to 321 lines due to extracted functions and documentation, but complexity decreased significantly

---

### 3. Poor Separation of Concerns (Medium Priority)

#### 3.1 Connection Point Detection Scattered
**Issue:** Connection point logic is scattered across 5+ files:
- `connection-points.ts`: Calculation logic
- `connection-point-renderer.ts`: Rendering
- `diagram-canvas.tsx`: Hit detection
- `mouse-handlers.ts`: Event handling
- `mouse-input.ts`: Callback setup

**Recommendation:** Create unified `connection-point-system.ts` module:
```typescript
export class ConnectionPointSystem {
  static findAtPosition(
    shapes: Shape[],
    x: number,
    y: number,
    tolerance: number
  ): ConnectionPoint | null

  static getConnectionPoints(shape: Shape): ConnectionPoint[]

  static renderConnectionPoints(
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    scale: number
  ): void

  static isHitByPoint(
    point: ConnectionPoint,
    shape: Shape
  ): boolean
}
```

**Status:** ✅ **COMPLETED** - 2025-10-24
**Details:** Created [connection-point-system.ts](src/shared/lib/connection-point-system.ts) as a unified API for all connection point operations:
- **`ConnectionPointSystem` class** - Static methods providing cohesive API
- **Finding**: `findAtPosition()`, `isHitByPoint()`, `getShapesNearPosition()`
- **Getting**: `getConnectionPoints()`, `getConnectionPoint()`, `getNearestAnchor()`, `getAnchorForDirection()`
- **Rendering**: `renderConnectionPoints()`, `renderMultipleShapeConnectionPoints()`, `renderConnectorPreview()`
- **Utilities**: `getOppositeAnchor()`

Refactored existing files to use the new system:
- [diagram-canvas.tsx](src/widgets/diagram-canvas/ui/diagram-canvas.tsx) - Replaced all `findConnectionPointAtPosition()` and `getShapesNearPosition()` calls with `ConnectionPointSystem` methods
- [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts) - Updated to use `ConnectionPointSystem` directly and fixed type definitions to use `AnchorPosition`
- **Removed** obsolete `connection-point-renderer.ts` - All functionality now in `ConnectionPointSystem`

All connection point functionality now accessible through a single, well-documented interface. The original helper functions in `connection-points.ts` are still available for lower-level usage, but the system provides a cleaner, more unified API.

---

#### 3.2 Grid Logic in Multiple Places
**Issue:** Grid concerns spread across:
- `grid-renderer.ts`: Rendering
- `grid-utils.ts`: Utility calculations
- `snap-to-grid.ts`: Snapping logic
- `canvas-config.ts`: Configuration

**Recommendation:** Create grid system module:
```typescript
export class GridSystem {
  static render(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    scale: number,
    pan: Point,
    config: GridConfig
  ): void

  static snapPoint(
    x: number,
    y: number,
    scale: number,
    mode: SnapMode
  ): Point

  static getGridSizeForZoom(zoom: number): GridSize
}
```

**Status:** ✅ **COMPLETED** - 2025-10-24
**Details:** Created [grid-system.ts](src/shared/lib/grid-system.ts) as a unified API for all grid operations:
- **`GridSystem` class** - Static methods providing cohesive API
- **Grid sizing**: `getGridSizeForZoom()` - Adaptive grid sizing based on zoom level
- **Snapping**: `snapPoint()`, `snapToMinorGrid()`, `snapToMajorGrid()` - Snap coordinates to grid intersections
- **Rendering**: `render()`, `renderLegacy()` - Draw grid on canvas with adaptive spacing
- **Internal utilities**: `drawGridLines()`, `snapToGridLine()` - Private helper methods

Refactored existing files to use the new system:
- [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts) - Uses `GridSystem.renderLegacy()`
- [mouse-handlers.ts](src/widgets/diagram-canvas/lib/mouse-handlers.ts) - Uses `GridSystem.snapPoint()` for entity dragging
- [canvas-store.ts](src/widgets/diagram-canvas/model/canvas-store.ts) - Imports `SnapMode` type from `GridSystem`
- [mouse-input-types.ts](src/widgets/diagram-canvas/lib/mouse-input-types.ts) - Imports `SnapMode` type from `GridSystem`
- [snap-mode-config.tsx](src/widgets/canvas-controls/config/snap-mode-config.tsx) - Imports `SnapMode` type from `GridSystem`

**Removed** obsolete files:
- ❌ `grid-renderer.ts`
- ❌ `grid-utils.ts`
- ❌ `snap-to-grid.ts`

All grid functionality now accessible through a single, well-documented interface. Grid configuration constants remain in `canvas-config.ts` as the single source of truth for configuration values.

---

#### 3.3 Shape Factory vs Shape Registry
**Issue:** Two separate systems for shape handling:
- Factories create new shapes
- Registry renders existing shapes
- No unified interface

**Recommendation:** Create unified shape system:
```typescript
export class ShapeSystem {
  static create(type: ShapeType, options: CreateShapeOptions): Shape
  static render(
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    isSelected: boolean,
    scale: number
  ): void
}
```

**Status:** ~~⬜ Not Started~~ **DEFERRED** - Shape system still evolving, will revisit after shape features stabilize

---

### 4. Inconsistent Patterns (Medium Priority)

#### 4.1 Rendering Function Signatures Vary
**Issue:** Different signatures across renderers:
- Shape renderers: `(ctx, shape, isSelected, scale) => void`
- Connector renderers: `(ctx, connector, shapes, isSelected, scale) => void`
- Grid renderer: `(ctx, width, height, scale, panX, panY, config) => void`

**Recommendation:** Standardize to context object pattern:
```typescript
interface RenderContext {
  ctx: CanvasRenderingContext2D;
  scale: number;
  entity: Shape | Connector;
  isSelected: boolean;
  dependencies?: Map<string, Shape>; // For connectors
}

export function renderShape(context: RenderContext): void
export function renderConnector(context: RenderContext): void
```

**Status:** ✅ **COMPLETED** - 2025-10-24
**Details:** Created [rendering-types.ts](src/shared/lib/rendering-types.ts) with standardized context interfaces:
- **`BaseRenderContext`** - Shared properties (ctx, scale)
- **`ShapeRenderContext`** - For rendering shapes (extends base + shape, isSelected)
- **`ConnectorRenderContext`** - For rendering connectors (extends base + connector, shapes, isSelected)
- **`GridRenderContext`** - For rendering grids (extends base + width, height, panX, panY, config)
- **`EntityRenderContext`** - Generic context for either shapes or connectors
- **Helper functions**: `isShape()`, `isConnector()` - Type guards for entity discrimination

Refactored rendering functions to use context pattern:
- [shape-renderer.ts](src/widgets/diagram-canvas/lib/shape-renderer.ts) - Added `renderShape(context)` using `ShapeRenderContext`, batch function `renderShapes()` for arrays
- [connector-renderer.ts](src/widgets/diagram-canvas/lib/connector-renderer.ts) - Added `renderConnector(context)` using `ConnectorRenderContext`, batch function `renderConnectors()` for arrays
- [grid-system.ts](src/shared/lib/grid-system.ts) - Updated `render(context)` to use `GridRenderContext`
- [canvas-renderer.ts](src/widgets/diagram-canvas/lib/canvas-renderer.ts) - Updated to use `GridSystem.render()` with context object

All renderers now follow a consistent pattern with context objects. No obsolete code - batch functions serve a legitimate purpose of iterating arrays and handling errors.

---

#### 4.2 Position Calculation Inconsistency ✅ COMPLETED
**Issue:** Multiple ways to handle centering:
- `calculatePosition()` with boolean flag
- `calculateCenteredPosition()` direct
- Factory options with `centered?: boolean`
- Some direct calculations in renderers

**Recommendation:** Single canonical approach:
```typescript
interface PositionOptions {
  reference: 'center' | 'top-left';
}
```

**Solution Implemented:**
- Created new types in [shape-position-utils.ts](src/shared/lib/shape-position-utils.ts): `PositionReference` and `PositionOptions` interface
- Changed `calculatePosition()` signature from boolean `centered` to `PositionOptions { reference }`
- Updated [base-factory-types.ts](src/entities/shape/lib/factories/base-factory-types.ts): Changed `centered?: boolean` to `reference?: PositionReference`
- Updated all shape factory functions to use `reference: 'center'` instead of `centered: true`:
  - [basic-shape-factory.ts](src/entities/shape/lib/factories/basic-shape-factory.ts) - 3 functions updated
  - [bpmn-shape-factory.ts](src/entities/shape/lib/factories/bpmn-shape-factory.ts) - 5 functions updated (Task, StartEvent, EndEvent, Gateway, Pool)
  - [tool-utils.ts](src/entities/tool/lib/tool-utils.ts) - 7 shape creation calls updated
- All `calculatePosition()` calls now use `{ reference }` options object
- Updated documentation examples to show new API

**Status:** ✅ Completed

---

#### 4.3 Error Handling Patterns ✅ COMPLETED
**Issue:** Inconsistent error handling:
- Some functions return `null` on error
- Others throw
- Some log and continue
- Renderers catch per-item but not aggregate

**Recommendation:** Standardized error strategy:
```typescript
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

**Solution Implemented:**

Created comprehensive error handling system in [result.ts](src/shared/lib/result.ts):
- **`Result<T>` type** - Discriminated union for operations that may fail
- **Helper functions**: `ok()`, `err()`, `unwrap()`, `unwrapOr()`, `map()`, `andThen()`
- **`ValidationResult` type** - For multi-error validation scenarios
- **Validation functions**: `valid()`, `invalid()`, `combineValidations()`
- **`AppError` interface** - Structured errors with severity levels, codes, and context
- **`ErrorSeverity` enum** - Info, Warning, Error, Critical severity levels
- **Error utilities**: `createError()`, `logError()` for consistent error formatting

Created entity validation system in [entity-validation.ts](src/shared/lib/entity-validation.ts):
- **`validateShape()`** - Comprehensive shape validation (ID, position, dimensions, colors, stroke width)
- **`validateConnector()`** - Connector validation including endpoint shape existence checks
- **`validateEntity()`** - Generic entity validation dispatcher
- **Component validators**: `validatePosition()`, `validateDimensions()`, `validateColor()`, `validateStrokeWidth()`
- All validators return `ValidationResult` with detailed error messages

Updated factory functions to use Result pattern:
- [connector-factory.ts](src/entities/connector/lib/factories/connector-factory.ts):
  - `createConnector()` now returns `Result<Connector>` instead of throwing
  - `createStraightConnector()`, `createOrthogonalConnector()`, `createCurvedConnector()` return Result types
  - Validates created connectors before returning
  - Updated [diagram-canvas.tsx:337-353](src/widgets/diagram-canvas/ui/diagram-canvas.tsx#L337-L353) to handle Result type

Standardized rendering error handling:
- [connector-renderer.ts](src/widgets/diagram-canvas/lib/connector-renderer.ts):
  - Uses `createError()` and `logError()` with structured context
  - Warning-level errors for invalid connectors with error code `CONNECTOR_INVALID`
  - Error-level errors for rendering failures with code `CONNECTOR_RENDER_ERROR`
  - Includes connector ID, type, and shape IDs in error context
- [shape-renderer.ts](src/widgets/diagram-canvas/lib/shape-renderer.ts):
  - Uses structured error logging with `SHAPE_RENDER_ERROR` and `SELECTION_BOX_RENDER_ERROR` codes
  - Includes shape ID and type in error context
  - Preserves error causes for debugging

Enhanced canvas store validation:
- [canvas-store.ts](src/widgets/diagram-canvas/model/canvas-store.ts):
  - `addShape()` validates shapes before adding, logs structured errors with `INVALID_SHAPE` code
  - `addConnector()` validates connectors including endpoint shape existence, logs with `INVALID_CONNECTOR` code
  - Invalid entities are rejected (not added to state) with detailed error logging
  - Error context includes entity IDs, types, and relevant shape references

**Error Handling Strategy:**
1. **Factory functions** - Return `Result<T>` for validation errors
2. **Renderers** - Use try-catch with structured error logging, continue rendering other items
3. **Store mutations** - Validate before mutating state, log and reject invalid entities
4. **Hit detection** - Return `null` for not-found cases (appropriate for query operations)
5. **Validation** - Return `ValidationResult` with array of errors for comprehensive feedback

**Status:** ✅ Completed - 2025-10-24

---

### 5. Type Safety Issues (Medium Priority)

#### 5.1 Unsafe Connector Casting ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 5.2 Optional but Required Fields ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 5.3 String Literals for Anchor Positions ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 5.4 Map Key Type Safety ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

### 6. Naming Inconsistencies (Low Priority)

#### 6.1 Plural vs Singular ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 6.2 Abbreviated vs Full Words ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 6.3 Get/Set Methods ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

### 7. Missing Abstractions (Medium Priority)

#### 7.1 No Transform System ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 7.2 No Entity System ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 7.3 No Undo/Redo System ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

#### 7.4 No Validation System ✅ COMPLETED
**Status:** ✅ **COMPLETED** - 2025-10-24

---

### 8. Tight Coupling (Medium Priority)

#### 8.1 Canvas Store Knows About Specific Entity Types
**Issue:** Store methods are entity-specific:
```typescript
updateShape()
updateConnector()
```

**Recommendation:** Make generic:
```typescript
updateEntity(id: string, updates: Partial<DiagramEntity>)
```

**Status:** ⬜ Not Started

---

#### 8.2 DiagramCanvas Tightly Coupled to Store Actions
**Issue:** Many direct store calls in component:
```typescript
const {
  addShape, updateShape, addConnector, getEntityAtPoint,
  isSelected, getSelectedEntities, ...
} = useCanvasStore();
```

**Recommendation:** Create facade/service layer:
```typescript
const canvasService = new CanvasService(useCanvasStore);
canvasService.createRectangle(x, y);
```

**Status:** ⬜ Not Started

---

#### 8.3 Rendering Functions Know About Selection
**Issue:** Every renderer checks `isSelected`:
```typescript
const strokeColor = isSelected ? selectedColor : defaultColor;
```

**Recommendation:** Pass styling separately:
```typescript
interface EntityStyle {
  strokeColor: string;
  strokeWidth: number;
}
function renderConnector(
  connector: Connector,
  shapes: Map<string, Shape>,
  style: EntityStyle
): void
```

**Status:** ⬜ Not Started

---

#### 8.4 Connector Rendering Depends on Shapes Map
**Issue:** Connectors can't render without knowing all shapes

**Recommendation:** Decouple by pre-calculating endpoints:
```typescript
interface RenderedConnector {
  connector: Connector;
  endpoints: { start: Point; end: Point };
}
```

**Status:** ⬜ Not Started

---

### 9. Configuration Issues (Low Priority)

#### 9.1 Magic Numbers Scattered
**Locations:**
- `diagram-canvas.tsx`: `MIN_DRAG_DISTANCE = 5`
- `connection-points.ts`: Distance calculations
- `connection-point-renderer.ts`: Radius calculations

**Recommendation:** Move all to config:
```typescript
export const CONNECTION_POINT_CONFIG = {
  radius: 4,
  hoverRadius: 6,
  hitTolerance: 10,
  dragThreshold: 5,
}
```

**Status:** ⬜ Not Started

---

#### 9.2 Hard-coded Colors
**Location:** Various renderers have fallbacks:
```typescript
strokeColor ?? CANVAS_COLORS.connectorStroke
```

**Recommendation:** Ensure colors always come from config

**Status:** ⬜ Not Started

---

### 10. Missing Error Handling (Low Priority)

#### 10.1 No Validation on Entity Creation
**Issue:** Can create entities with invalid data:
```typescript
// Can create with invalid dimensions
createRectangle(x, y, { width: 0, height: -5 })
```

**Recommendation:** Add validation in factory functions

**Status:** ⬜ Not Started

---

#### 10.2 No Bounds Checking
**Issue:** Can pan/zoom infinitely:
```typescript
calculateZoomToPoint(mousePos, transform, delta, minScale, maxScale)
// minScale/maxScale are parameters, not enforced
```

**Recommendation:** Enforce bounds in transform system

**Status:** ⬜ Not Started

---

#### 10.3 Silent Failures in Rendering
**Issue:** Missing shapes cause silent skips:
```typescript
if (!endpoints) return; // No warning or log
```

**Recommendation:** Add logging or user feedback

**Status:** ⬜ Not Started

---

## Refactoring Priority

### Phase 1 - High Impact (Start Here)
1. ✅ Extract connection point system
2. ⬜ Break down DiagramCanvas component (443 lines → 4 smaller components)
3. ~~⬜ Extract duplicate factory patterns~~ **DEFERRED**
4. ✅ Separate hit detection from store
5. ~~⬜ Extract duplicate selection state management~~ **REJECTED**
6. ✅ Refactor mouse input setup
7. ✅ Extract grid system

### Phase 2 - Quality Improvements
6. ✅ Create Transform system class
7. ✅ Standardize rendering function signatures
8. ✅ Improve type safety (remove unsafe casts, use AnchorPosition types, add map utilities)
9. ✅ Add validation system (entity-validation.ts integrated with EntitySystem)
10. ✅ Extract connector color logic
11. ✅ Create Entity System (7.2)

### Phase 3 - Polish & Infrastructure
12. ✅ Consolidate naming conventions
13. ⬜ Extract magic numbers to config
14. ✅ Add undo/redo infrastructure
15. ⬜ Improve error handling throughout

---

## Progress Tracking

**Total Items:** 40
**Completed:** 20
**In Progress:** 0
**Not Started:** 17
**Deferred:** 2
**Rejected:** 1

**Last Updated:** 2025-10-24

---

## Notes

- Maintain existing registry patterns - they work well
- Keep type safety as a priority throughout refactoring
- Test each refactoring independently before moving to the next
- Consider creating feature branches for larger refactorings
