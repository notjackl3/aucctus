/**
 * Agent Component Compiler
 *
 * This module provides the compilation pipeline for transforming
 * React TSX components into browser-executable JavaScript with
 * runtime scope injection.
 *
 * @example
 * ```typescript
 * import {
 *   compileComponent,
 *   verifyTSXSource,
 *   verifyCompiledCode,
 *   formatErrorForAgent
 * } from './compiler';
 *
 * // 1. Verify source before compiling
 * const sourceCheck = verifyTSXSource(tsxCode);
 * if (!sourceCheck.valid) {
 *   return formatErrorForAgent(sourceCheck); // Send to agent for fixing
 * }
 *
 * // 2. Compile
 * const result = await compileComponent(tsxCode);
 *
 * // 3. Verify compiled output
 * const compiledCheck = verifyCompiledCode(result.code);
 * if (!compiledCheck.valid) {
 *   return formatErrorForAgent(compiledCheck); // Send to agent for fixing
 * }
 *
 * // 4. Success - send to frontend
 * return result.code;
 * ```
 */

// Compilation
export {
  compileComponent,
  compileComponentFromFile,
  validateCompiledCode,
  analyzeComponent,
  type CompilerOptions,
  type CompilationResult,
} from './compile';

// Verification
export {
  verifyTSXSource,
  verifyCompiledCode,
  quickVerify,
  formatErrorForAgent,
  formatErrorAsJSON,
  type VerificationResult,
  type VerificationError,
  type ErrorCode,
} from './verify';
