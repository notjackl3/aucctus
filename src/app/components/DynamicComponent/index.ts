/**
 * DynamicComponent Module
 *
 * Provides runtime rendering of React components compiled by the agent.
 *
 * @example
 * ```tsx
 * import { DynamicComponentRenderer } from '@components/DynamicComponent';
 *
 * // From API endpoint
 * <DynamicComponentRenderer
 *   componentUrl="/api/components/my-report"
 *   componentId="my-report"
 *   onLoad={() => console.log('Ready!')}
 * />
 *
 * // From compiled code
 * <DynamicComponentRenderer
 *   compiledCode={agentGeneratedCode}
 *   componentId="inline-component"
 * />
 * ```
 */

export {
  DynamicComponentRenderer,
  type DynamicComponentRendererProps,
} from './DynamicComponentRenderer';

export {
  createScope,
  executeWithScope,
  validateComponent,
  verifyComponent,
  Components,
  Utils,
  Recharts,
  type ComponentScope,
  type VerificationResult,
} from './scopeRegistry';
