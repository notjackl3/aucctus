#!/usr/bin/env node
/**
 * Verify a TSX component or compiled JS file
 * 
 * Usage:
 *   node scripts/verify.mjs <path-to-file>
 *   node scripts/verify.mjs component.tsx          # Verify TSX source
 *   node scripts/verify.mjs component.js           # Verify compiled JS
 *   node scripts/verify.mjs component.tsx --json   # Output as JSON
 * 
 * Examples:
 *   node scripts/verify.mjs ../generated-components/MyComponent.tsx
 *   node scripts/verify.mjs ../public/compiled/MyComponent.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// ALLOWED IMPORTS - Keep in sync with scopeRegistry.ts
// ============================================================================

const ALLOWED_IMPORTS = new Set([
  'react',
  'recharts',
  'react-markdown',
  '@components',
  '@libs/utils/react',
  '@radix-ui/react-popover',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-select',
]);

const FORBIDDEN_IMPORTS = {
  'framer-motion': 'Use Tailwind animations (animate-fade-in, transition-all)',
  'react-icons': 'Use <Icon variant="..." /> from @components',
  'lucide-react': 'Use <Icon variant="..." /> from @components',
  'lodash': 'Use native JavaScript methods',
  'moment': 'Use dateFormatter() or formatDate() from Utils',
  'date-fns': 'Use dateFormatter() or formatDate() from Utils',
  'axios': 'Use native fetch()',
  'classnames': 'Use cn() from @libs/utils/react',
  'clsx': 'Use cn() from @libs/utils/react',
};

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

function verifyTSXSource(tsxCode) {
  const errors = [];
  const warnings = [];

  // Check for default export
  const hasDefaultExport =
    /export\s+default\s+/.test(tsxCode) ||
    /export\s*\{[^}]*\bas\s+default\b/.test(tsxCode);

  if (!hasDefaultExport) {
    errors.push({
      code: 'NO_DEFAULT_EXPORT',
      message: 'Component must have a default export',
      hint: 'Add "export default ComponentName;" or "export default React.memo(ComponentName);"',
      severity: 'error',
    });
  }

  // Check imports
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(tsxCode)) !== null) {
    const importPath = match[1];
    const line = tsxCode.substring(0, match.index).split('\n').length;

    // Check for forbidden imports
    if (FORBIDDEN_IMPORTS[importPath]) {
      errors.push({
        code: 'FORBIDDEN_IMPORT',
        message: `"${importPath}" is not allowed`,
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
        hint: 'Only react, @components, @libs/utils/react, recharts, and @radix-ui/* are allowed',
        severity: 'error',
      });
    }
  }

  // Check for common Badge mistake
  if (tsxCode.includes('<Badge') && (tsxCode.includes('text=') || tsxCode.includes('variant='))) {
    const badgeMatch = tsxCode.match(/<Badge[^>]*(text=|variant=)/);
    if (badgeMatch) {
      errors.push({
        code: 'BADGE_WRONG_PROPS',
        message: 'Badge uses "value" prop, not "text" or "variant"',
        hint: 'Use <Badge value="Label" /> instead',
        severity: 'error',
      });
    }
  }

  // Check for Icon without stroke class
  const iconMatches = tsxCode.matchAll(/<Icon\s+[^>]*className=["']([^"']*)["'][^>]*>/g);
  for (const iconMatch of iconMatches) {
    const className = iconMatch[1];
    if (!className.includes('stroke') && !className.includes('aucctus-stroke')) {
      warnings.push(`Icon may be missing stroke class: ${iconMatch[0].substring(0, 60)}...`);
    }
  }

  return {
    valid: errors.length === 0,
    stage: 'source',
    errors,
    warnings,
  };
}

function verifyCompiledCode(compiledCode) {
  const errors = [];
  const warnings = [];

  const trimmed = compiledCode.trim();

  // Check basic structure
  if (!trimmed.startsWith('//') && !trimmed.startsWith('(function')) {
    errors.push({
      code: 'INVALID_STRUCTURE',
      message: 'Compiled code has invalid structure',
      hint: 'Should start with factory function wrapper',
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
      `"use strict"; return (${compiledCode})(React, Components, Utils, Recharts);`
    );
  } catch (err) {
    errors.push({
      code: 'SYNTAX_ERROR',
      message: err.message,
      hint: extractSyntaxHint(err.message),
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    stage: 'compiled',
    errors,
    warnings,
  };
}

function extractSyntaxHint(message) {
  if (message.includes('Unexpected token')) {
    return 'Check for missing brackets, parentheses, or commas';
  }
  if (message.includes('Unexpected identifier')) {
    return 'Check for missing semicolons or incorrect variable declarations';
  }
  if (message.includes('Unexpected end of input')) {
    return 'Check for unclosed brackets, braces, or template literals';
  }
  if (message.includes('is not defined')) {
    const match = message.match(/(\w+) is not defined/);
    if (match) {
      return `"${match[1]}" is not available. Check ALLOWED_IMPORTS_GUIDE.md`;
    }
  }
  return 'Review the syntax near the error location';
}

// ============================================================================
// OUTPUT FORMATTING
// ============================================================================

function formatResult(result, filePath) {
  const lines = [];
  
  if (result.valid) {
    lines.push(`✅ ${filePath}`);
    lines.push(`   Stage: ${result.stage}`);
    lines.push(`   Status: Valid`);
    
    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('   ⚠️  Warnings:');
      for (const warning of result.warnings) {
        lines.push(`      - ${warning}`);
      }
    }
  } else {
    lines.push(`❌ ${filePath}`);
    lines.push(`   Stage: ${result.stage}`);
    lines.push(`   Status: ${result.errors.length} error(s)`);
    lines.push('');
    
    for (const error of result.errors) {
      lines.push(`   🔴 ${error.code}`);
      lines.push(`      Message: ${error.message}`);
      if (error.line) {
        lines.push(`      Line: ${error.line}`);
      }
      lines.push(`      Fix: ${error.hint}`);
      lines.push('');
    }
    
    if (result.warnings.length > 0) {
      lines.push('   ⚠️  Warnings:');
      for (const warning of result.warnings) {
        lines.push(`      - ${warning}`);
      }
    }
  }
  
  return lines.join('\n');
}

function formatForAgent(result) {
  if (result.valid) {
    return '✅ Component verification passed.';
  }

  const lines = [
    `❌ Component verification failed at ${result.stage} stage.`,
    '',
    '## Errors:',
  ];

  for (const error of result.errors) {
    lines.push('');
    lines.push(`### ${error.code}`);
    lines.push(`**Message:** ${error.message}`);
    if (error.line) {
      lines.push(`**Line:** ${error.line}`);
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

// ============================================================================
// MAIN
// ============================================================================

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const agentOutput = args.includes('--agent');
const filePath = args.find(arg => !arg.startsWith('--'));

if (!filePath) {
  console.log(`
Component Verification Script

Usage:
  node scripts/verify.mjs <path-to-file> [options]

Options:
  --json    Output as JSON (for API integration)
  --agent   Output formatted for agent feedback

Examples:
  node scripts/verify.mjs ../generated/MyComponent.tsx
  node scripts/verify.mjs ../public/compiled/MyComponent.js
  node scripts/verify.mjs component.tsx --json
  node scripts/verify.mjs component.tsx --agent
`);
  process.exit(1);
}

const absolutePath = path.resolve(__dirname, '..', filePath);

if (!fs.existsSync(absolutePath)) {
  console.error(`❌ File not found: ${absolutePath}`);
  process.exit(1);
}

const content = fs.readFileSync(absolutePath, 'utf8');
const ext = path.extname(filePath).toLowerCase();

let result;

if (ext === '.tsx' || ext === '.ts') {
  console.log(`\n🔍 Verifying TSX source: ${filePath}\n`);
  result = verifyTSXSource(content);
} else if (ext === '.js') {
  console.log(`\n🔍 Verifying compiled JS: ${filePath}\n`);
  result = verifyCompiledCode(content);
} else {
  console.error(`❌ Unsupported file type: ${ext}`);
  console.error('   Supported: .tsx, .ts, .js');
  process.exit(1);
}

// Output
if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
} else if (agentOutput) {
  console.log(formatForAgent(result));
} else {
  console.log(formatResult(result, filePath));
}

// Exit with error code if invalid
process.exit(result.valid ? 0 : 1);

