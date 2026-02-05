/**
 * Component Verification Module
 *
 * Provides pre-compilation and post-compilation verification for dynamic components.
 * Use this to catch errors before sending components to the frontend.
 *
 * @example
 * ```typescript
 * import { verifyTSXSource, verifyCompiledCode, formatErrorForAgent } from './verify';
 *
 * // Before compilation
 * const sourceCheck = verifyTSXSource(tsxCode);
 * if (!sourceCheck.valid) {
 *   console.error(formatErrorForAgent(sourceCheck));
 *   // Fix and retry
 * }
 *
 * // After compilation
 * const compiledCheck = verifyCompiledCode(compiledCode);
 * if (!compiledCheck.valid) {
 *   console.error(formatErrorForAgent(compiledCheck));
 *   // Regenerate component
 * }
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VerificationResult {
  valid: boolean;
  stage: 'source' | 'compiled' | 'structure';
  errors: VerificationError[];
  warnings: string[];
}

export interface VerificationError {
  code: ErrorCode;
  message: string;
  line?: number;
  column?: number;
  hint: string;
  severity: 'error' | 'warning';
}

export type ErrorCode =
  | 'NO_DEFAULT_EXPORT'
  | 'FORBIDDEN_IMPORT'
  | 'INVALID_IMPORT_PATH'
  | 'MISSING_REACT_IMPORT'
  | 'SYNTAX_ERROR'
  | 'INVALID_COMPONENT_TYPE'
  | 'UNDEFINED_REFERENCE'
  | 'INVALID_JSX'
  | 'BADGE_WRONG_PROPS'
  | 'ICON_MISSING_STROKE'
  | 'NAMESPACE_AS_COMPONENT';

// ============================================================================
// ALLOWED IMPORTS - Keep in sync with scopeRegistry.ts
// ============================================================================

const ALLOWED_IMPORTS = new Set([
  'react',
  'recharts',
  'react-markdown',
  'lucide-react',
  'framer-motion',
  '@components',
  '@libs/utils/react',
  // All Radix UI packages
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
]);

const FORBIDDEN_IMPORTS: Record<string, string> = {
  'react-icons': 'Use lucide-react or <Icon variant="..." /> from @components',
  lodash: 'Use native JavaScript methods',
  moment: 'Use dateFormatter() or formatDate() from Utils',
  'date-fns': 'Use dateFormatter() or formatDate() from Utils',
  axios: 'Use native fetch()',
  classnames: 'Use cn() from @libs/utils/react',
  clsx: 'Use cn() from @libs/utils/react',
};

// ============================================================================
// SOURCE VERIFICATION (Before Compilation)
// ============================================================================

/**
 * Verify TSX source code before compilation.
 * Catches common issues that would cause runtime errors.
 */
export function verifyTSXSource(tsxCode: string): VerificationResult {
  const errors: VerificationError[] = [];
  const warnings: string[] = [];

  // Check for default export
  const hasDefaultExport =
    /export\s+default\s+/.test(tsxCode) ||
    /export\s*\{[^}]*\bas\s+default\b/.test(tsxCode);

  if (!hasDefaultExport) {
    errors.push({
      code: 'NO_DEFAULT_EXPORT',
      message: 'Component must have a default export',
      hint: 'Add "export default ComponentName;" or "export default React.memo(ComponentName);" at the end of your component',
      severity: 'error',
    });
  }

  // Check imports
  const importRegex =
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(tsxCode)) !== null) {
    const importPath = match[1];
    const line = tsxCode.substring(0, match.index).split('\n').length;

    // Check for forbidden imports
    if (FORBIDDEN_IMPORTS[importPath]) {
      errors.push({
        code: 'FORBIDDEN_IMPORT',
        message: `"${importPath}" is not allowed in dynamic components`,
        line,
        hint: FORBIDDEN_IMPORTS[importPath],
        severity: 'error',
      });
    }

    // Check for unknown imports
    const isAllowed =
      ALLOWED_IMPORTS.has(importPath) ||
      importPath.startsWith('@radix-ui/') ||
      importPath.startsWith('@components/') ||
      importPath.startsWith('@libs/');

    if (!isAllowed && !FORBIDDEN_IMPORTS[importPath]) {
      errors.push({
        code: 'INVALID_IMPORT_PATH',
        message: `Unknown import "${importPath}"`,
        line,
        hint: 'Only imports from react, @components, @libs/utils/react, recharts, and @radix-ui/* are allowed',
        severity: 'error',
      });
    }
  }

  // Check for React import
  if (!tsxCode.includes("from 'react'") && !tsxCode.includes('from "react"')) {
    warnings.push(
      'Consider adding "import React from \'react\';" for explicit React reference',
    );
  }

  // Check for common Badge mistake
  if (
    tsxCode.includes('<Badge') &&
    (tsxCode.includes('text=') || tsxCode.includes('variant='))
  ) {
    const badgeWithTextMatch = tsxCode.match(/<Badge[^>]*(text=|variant=)/);
    if (badgeWithTextMatch) {
      errors.push({
        code: 'BADGE_WRONG_PROPS',
        message: 'Badge component uses "value" prop, not "text" or "variant"',
        hint: 'Use <Badge value="Label" /> instead of <Badge text="Label" /> or <Badge variant="...">',
        severity: 'error',
      });
    }
  }

  // Check for Icon without stroke class (warning only)
  const iconMatches = tsxCode.matchAll(
    /<Icon\s+[^>]*className=["']([^"']*)["'][^>]*>/g,
  );
  for (const iconMatch of iconMatches) {
    const className = iconMatch[1];
    if (
      !className.includes('stroke') &&
      !className.includes('aucctus-stroke')
    ) {
      warnings.push(
        `Icon at "${iconMatch[0].substring(0, 50)}..." may be missing a stroke class. Use aucctus-stroke-* classes.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    stage: 'source',
    errors,
    warnings,
  };
}

// ============================================================================
// COMPILED CODE VERIFICATION (After Compilation)
// ============================================================================

/**
 * Verify compiled JavaScript code before sending to frontend.
 * Catches syntax errors and structural issues.
 */
export function verifyCompiledCode(compiledCode: string): VerificationResult {
  const errors: VerificationError[] = [];
  const warnings: string[] = [];

  // Check basic structure
  const trimmed = compiledCode.trim();

  if (!trimmed.startsWith('//') && !trimmed.startsWith('(function')) {
    errors.push({
      code: 'SYNTAX_ERROR',
      message: 'Compiled code has invalid structure',
      hint: 'The compiled code should start with a factory function wrapper',
      severity: 'error',
    });
    return { valid: false, stage: 'compiled', errors, warnings };
  }

  // Try to parse as JavaScript
  try {
    new Function(
      'React',
      'Components',
      'Utils',
      'Recharts',
      'LucideIcons',
      'RadixUI',
      'FramerMotion',
      `"use strict"; return (${compiledCode})(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion);`,
    );
  } catch (err) {
    const error = err as Error;
    const syntaxError = extractSyntaxErrorInfo(error.message);

    errors.push({
      code: 'SYNTAX_ERROR',
      message: error.message,
      line: syntaxError.line,
      column: syntaxError.column,
      hint: syntaxError.hint,
      severity: 'error',
    });
  }

  // Check for common undefined references in the wrapper
  const undefinedRefs = checkUndefinedReferences(compiledCode);
  for (const ref of undefinedRefs) {
    warnings.push(
      `Potential undefined reference: "${ref}". Ensure it's imported from allowed modules.`,
    );
  }

  return {
    valid: errors.length === 0,
    stage: 'compiled',
    errors,
    warnings,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractSyntaxErrorInfo(message: string): {
  line?: number;
  column?: number;
  hint: string;
} {
  // Try to extract line/column from error message
  const lineMatch = message.match(/line (\d+)/i);
  const columnMatch = message.match(/column (\d+)/i);

  let hint = 'Review the syntax near the error location';

  if (message.includes('Unexpected token')) {
    hint = 'Check for missing brackets, parentheses, or commas';
  } else if (message.includes('Unexpected identifier')) {
    hint = 'Check for missing semicolons or incorrect variable declarations';
  } else if (message.includes('Unexpected end of input')) {
    hint = 'Check for unclosed brackets, braces, or template literals';
  } else if (message.includes('is not defined')) {
    const match = message.match(/(\w+) is not defined/);
    if (match) {
      hint = `"${match[1]}" is not available. Check ALLOWED_IMPORTS_GUIDE.md for available imports`;
    }
  }

  return {
    line: lineMatch ? parseInt(lineMatch[1]) : undefined,
    column: columnMatch ? parseInt(columnMatch[1]) : undefined,
    hint,
  };
}

function checkUndefinedReferences(code: string): string[] {
  const refs: string[] = [];

  // Common patterns that indicate undefined references
  // Note: framer/motion are now allowed via FramerMotion namespace
  const patterns = [/\blodash\b/i, /\b_\./, /\bmoment\b/i, /\bdayjs\b/i];

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      refs.push(pattern.source.replace(/\\b/g, '').replace(/\\./g, '.'));
    }
  }

  return refs;
}

// ============================================================================
// ERROR FORMATTING FOR AGENT
// ============================================================================

/**
 * Format verification result as a message for the agent to understand and fix.
 */
export function formatErrorForAgent(result: VerificationResult): string {
  if (result.valid) {
    return '✅ Component verification passed.';
  }

  const lines: string[] = [
    `❌ Component verification failed at ${result.stage} stage.`,
    '',
    '## Errors:',
  ];

  for (const error of result.errors) {
    lines.push('');
    lines.push(`### ${error.code}`);
    lines.push(`**Message:** ${error.message}`);
    if (error.line) {
      lines.push(
        `**Location:** Line ${error.line}${error.column ? `, Column ${error.column}` : ''}`,
      );
    }
    lines.push(`**How to fix:** ${error.hint}`);
  }

  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('## Warnings:');
    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('Please fix the errors above and regenerate the component.');

  return lines.join('\n');
}

/**
 * Format as structured JSON for API responses
 */
export function formatErrorAsJSON(result: VerificationResult): object {
  return {
    valid: result.valid,
    stage: result.stage,
    errors: result.errors.map((e) => ({
      code: e.code,
      message: e.message,
      line: e.line,
      column: e.column,
      hint: e.hint,
      severity: e.severity,
    })),
    warnings: result.warnings,
  };
}

// ============================================================================
// QUICK VERIFICATION (All-in-one)
// ============================================================================

/**
 * Quick verification that checks both source and compiled code.
 * Returns the first failure or success if all pass.
 */
export async function quickVerify(
  tsxCode: string,
  compiledCode?: string,
): Promise<VerificationResult> {
  // Check source first
  const sourceResult = verifyTSXSource(tsxCode);
  if (!sourceResult.valid) {
    return sourceResult;
  }

  // If compiled code provided, check that too
  if (compiledCode) {
    const compiledResult = verifyCompiledCode(compiledCode);
    if (!compiledResult.valid) {
      return compiledResult;
    }
  }

  return {
    valid: true,
    stage: 'structure',
    errors: [],
    warnings: [...sourceResult.warnings],
  };
}
