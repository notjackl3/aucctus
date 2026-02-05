/**
 * Types for Dynamic Component Generation API
 *
 * This service generates React components from Gemini reports via Claude CLI.
 * The flow is:
 * 1. Frontend calls osiris to initiate generation
 * 2. Osiris returns 202 Accepted with component UUID
 * 3. WebSocket updates notify when generation completes
 * 4. Frontend fetches the generated component
 */

// ============================================
// Component Status
// ============================================

export type DynamicComponentStatus =
  | 'pending'
  | 'prd_generating'
  | 'generating'
  | 'completed'
  | 'failed';

// ============================================
// Request/Response Types
// ============================================

/**
 * Request to generate a component
 */
export interface IGenerateComponentRequest {
  /** UUID of the concept to generate component for */
  conceptUuid: string;
  /** Report content (markdown) to visualize */
  reportContent: string;
  /** Optional component name hint */
  componentName?: string;
}

/**
 * Response from generate endpoint (202 Accepted)
 */
export interface IGenerateComponentResponse {
  /** UUID of the created component record */
  componentUuid: string;
  /** UUID of the concept */
  conceptUuid: string;
  /** Initial status (always 'pending') */
  status: DynamicComponentStatus;
  /** Status message */
  message: string;
}

/**
 * Full component data
 */
export interface IDynamicComponent {
  /** Component UUID */
  uuid: string;
  /** Concept UUID */
  conceptUuid: string;
  /** Current status */
  status: DynamicComponentStatus;
  /** Component name (e.g., "MarketAnalysisChart") */
  componentName: string | null;
  /** TSX source code */
  sourceCode: string | null;
  /** Compiled JavaScript code */
  compiledCode: string | null;
  /** Generated PRD markdown document */
  prdContent: string | null;
  /** Error message if failed */
  errorMessage: string | null;
  /** Component generation duration in milliseconds */
  durationMs: number | null;
  /** PRD generation duration in milliseconds */
  prdDurationMs: number | null;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * List of components response
 */
export interface IComponentListResponse {
  components: IDynamicComponent[];
}

// ============================================
// WebSocket Message Types
// ============================================

/**
 * WebSocket progress message for component generation
 */
export interface IDynamicComponentProgressMessage {
  type: 'dynamic_component.progress.account';
  accountUuid: string;
  conceptUuid: string;
  componentUuid: string;
  stage: 'pending' | 'prd_generating' | 'generating' | 'completed' | 'failed';
  message: string;
  /** Only present when completed successfully */
  componentName?: string;
  /** Only present when completed */
  durationMs?: number;
  /** Only present on error */
  errorMessage?: string;
}

// ============================================
// Legacy Types (for backwards compatibility)
// ============================================

/**
 * @deprecated Use IDynamicComponent instead
 */
export interface IGeneratedComponent {
  name: string;
  filename: string;
  sourceCode: string | null;
  compiledCode: string | null;
  filePath: string;
  compiledPath: string | null;
  createdAt: string | null;
  sizeBytes: number | null;
}

/**
 * Health check response
 */
export interface IHealthResponse {
  status: string;
  version: string;
  claudeAuthenticated: boolean;
}
