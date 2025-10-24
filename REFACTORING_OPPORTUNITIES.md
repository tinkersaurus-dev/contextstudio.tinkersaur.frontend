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

**Status:** ⬜ Not Started

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

**Status:** ⬜ Not Started

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

**Status:** ⬜ Not Started

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

**Status:** ⬜ Not Started

---

#### 4.2 Position Calculation Inconsistency
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

**Status:** ⬜ Not Started

---

#### 4.3 Error Handling Patterns
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

**Status:** ⬜ Not Started

---

### 5. Type Safety Issues (Medium Priority)

#### 5.1 Unsafe Connector Casting
**Location:** `entities/connector/ui/straight-connector.ts` and other connector renderers
**Issue:** Unsafe type casts:
```typescript
const straightConnector = connector as StraightConnector;
```

**Recommendation:** Use type guards:
```typescript
function renderConnector(connector: Connector, ...): void {
  if (isStraightConnector(connector)) {
    // narrowed type, safe to use
  }
}
```

**Status:** ⬜ Not Started

---

#### 5.2 Optional but Required Fields
**Location:** Multiple entity types
**Issue:** Properties marked optional but actually required:
```typescript
export interface BaseConnector {
  source: ConnectionPoint;  // Always present
  target: ConnectionPoint;  // Always present
  strokeColor?: string;     // Optional
  strokeWidth?: number;     // Optional
}
```

**Recommendation:** Don't mark required fields as optional

**Status:** ⬜ Not Started

---

#### 5.3 String Literals for Anchor Positions
**Location:** `connection-points.ts`, `connector-rendering-utils.ts`
**Issue:** Anchor type is string in some places:
```typescript
export function getAnchorDirection(anchor: string): Position {
```

**Recommendation:** Use `AnchorPosition` type everywhere

**Status:** ⬜ Not Started

---

#### 5.4 Map Key Type Safety
**Location:** `canvas-store.ts`, `connector-renderer.ts`
**Issue:** Maps created without explicit type safety:
```typescript
const shapesMap = new Map(shapes.map((s) => [s.id, s]));
```

**Recommendation:** Utility function with explicit typing:
```typescript
function createShapeMap(shapes: Shape[]): Map<string, Shape> {
  return new Map(shapes.map(s => [s.id, s]));
}
```

**Status:** ⬜ Not Started

---

### 6. Naming Inconsistencies (Low Priority)

#### 6.1 Plural vs Singular
**Issue:** Inconsistent naming patterns:
- `shapes` (array) vs `shapesRef` (ref)
- `connectors` vs `connectorsForShape()`
- `selectedEntityIds` vs `selectedEntities`

**Recommendation:** Standardize:
- Arrays: `shapes`, `connectors`
- Maps: `shapesById`, `connectorsById`
- Refs: `shapesRef`, `connectorsRef`

**Status:** ⬜ Not Started

---

#### 6.2 Abbreviated vs Full Words
**Issue:** Inconsistent abbreviations:
- `ctx` vs `canvasRenderingContext2D`
- `pos` vs `position`
- `dims` vs `dimensions`

**Recommendation:** Be consistent:
- Use abbreviated forms for common parameters (`ctx`, `x`, `y`)
- Use full names for properties and state variables

**Status:** ⬜ Not Started

---

#### 6.3 Get/Set Methods
**Issue:** Inconsistent retrieval method naming:
```typescript
getSelectedEntities()      // returns array
getConnectorsForShape()    // returns array
getEntityAtPoint()         // returns single or null
```

**Recommendation:** Prefix clearly:
```typescript
getSelectedEntities()       // returns array
getAllConnectorsForShape()  // returns array
findEntityAtPoint()         // returns single or null
```

**Status:** ⬜ Not Started

---

### 7. Missing Abstractions (Medium Priority)

#### 7.1 No Transform System
**Issue:** Transform (scale, pan) logic scattered across:
- `canvas-coordinates.ts`: Conversion
- `mouse-handlers.ts`: Zoom calculation
- Various renderers: Scale adjustments

**Recommendation:** Create `Transform` class:
```typescript
export class CanvasTransform {
  constructor(
    public scale: number,
    public panX: number,
    public panY: number
  ) {}

  screenToWorld(screenX: number, screenY: number): Point
  worldToScreen(worldX: number, worldY: number): Point
  calculateZoom(mousePos: Point, delta: number): Transform
  applyToContext(ctx: CanvasRenderingContext2D): void
}
```

**Status:** ⬜ Not Started

---

#### 7.2 No Entity System
**Issue:** Entity operations scattered:
- Selection in store
- Rendering in widgets
- Hit detection in store
- Creation in factories

**Recommendation:** Create `Entity` base class:
```typescript
export abstract class Entity {
  abstract render(ctx: CanvasRenderingContext2D, scale: number): void
  abstract hitTest(x: number, y: number): boolean
  abstract getBounds(): Bounds
}
```

**Status:** ⬜ Not Started

---

#### 7.3 No Undo/Redo System
**Issue:** All mutations are immediate with no history tracking

**Recommendation:** Add command pattern:
```typescript
export interface Command {
  execute(): void
  undo(): void
}

export class CommandHistory {
  private history: Command[] = [];
  private position: number = -1;

  execute(command: Command): void
  undo(): void
  redo(): void
}
```

**Status:** ⬜ Not Started

---

#### 7.4 No Validation System
**Issue:** Data validation scattered or missing:
- Connector endpoints not validated
- Shape dimensions not checked for validity
- Position bounds not validated

**Recommendation:** Create validation module:
```typescript
export class EntityValidator {
  static validateShape(shape: Shape): ValidationResult
  static validateConnector(
    connector: Connector,
    shapes: Shape[]
  ): ValidationResult
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }
```

**Status:** ⬜ Not Started

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
1. ⬜ Extract connection point system
2. ⬜ Break down DiagramCanvas component (443 lines → 4 smaller components)
3. ~~⬜ Extract duplicate factory patterns~~ **DEFERRED**
4. ✅ Separate hit detection from store
5. ~~⬜ Extract duplicate selection state management~~ **REJECTED**
6. ✅ Refactor mouse input setup

### Phase 2 - Quality Improvements
6. ⬜ Create Transform system class
7. ⬜ Standardize rendering function signatures
8. ⬜ Improve type safety (remove unsafe casts)
9. ⬜ Add validation system
10. ✅ Extract connector color logic

### Phase 3 - Polish & Infrastructure
11. ⬜ Consolidate naming conventions
12. ⬜ Extract magic numbers to config
13. ⬜ Add undo/redo infrastructure
14. ⬜ Create unified grid system
15. ⬜ Improve error handling throughout

---

## Progress Tracking

**Total Items:** 40
**Completed:** 4
**In Progress:** 0
**Not Started:** 34
**Deferred:** 1
**Rejected:** 1

**Last Updated:** 2025-10-24

---

## Notes

- Maintain existing registry patterns - they work well
- Keep type safety as a priority throughout refactoring
- Test each refactoring independently before moving to the next
- Consider creating feature branches for larger refactorings
