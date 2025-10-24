/**
 * Connector Entity
 *
 * Public API for the connector entity layer.
 * Connectors are lines/edges that connect shapes in the diagram.
 */

// Types
export type {
  Connector,
  ConnectorType,
  AnchorPosition,
  ConnectionPoint,
  StraightConnector,
  OrthogonalConnector,
  CurvedConnector,
  Position,
  Dimensions,
} from './model/types';

export {
  isConnector,
  isStraightConnector,
  isOrthogonalConnector,
  isCurvedConnector,
} from './model/types';

export { ConnectorType as ConnectorTypeEnum } from './model/types';

// Registry
export {
  connectorRegistry,
  renderConnectorFromRegistry,
  type ConnectorRenderer,
} from './lib/connector-registry';

// Geometry utilities
export {
  getConnectorEndpoints,
  calculateConnectorBounds,
  generateOrthogonalPath,
  generateCurveControlPoints,
  isConnectorValid,
  getConnectorsForShape,
  updateConnectorForShapeMove,
  calculateArrowAngle,
  getAnchorDirection,
} from './lib/connector-geometry';

// Factory functions
export {
  createConnector,
  createStraightConnector,
  createOrthogonalConnector,
  createCurvedConnector,
  type ConnectorCreationOptions,
} from './lib/factories/connector-factory';

// Renderers (individual exports for testing/customization)
export { renderStraightConnector } from './ui/straight-connector';
export { renderOrthogonalConnector } from './ui/orthogonal-connector';
export { renderCurvedConnector } from './ui/curved-connector';
export {
  renderArrowhead,
  renderConnectionPoints,
  getPointAlongLine,
} from './ui/connector-rendering-utils';
