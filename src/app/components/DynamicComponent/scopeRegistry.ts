/**
 * Scope Registry
 *
 * This module provides all the dependencies that can be injected into
 * dynamically compiled components at runtime.
 *
 * When the agent generates a component with imports like:
 * - `import { Icon } from '@components'`
 * - `import { cn } from '@libs/utils/react'`
 * - `import { BarChart } from 'recharts'`
 *
 * These are resolved from this registry at runtime.
 *
 * IMPORTANT: Some @components exports are namespace objects, not components!
 * - Badge, Card, Chart, Legend, Text are namespaces with sub-components
 * - We export the most commonly used sub-component as the default
 */

import React from 'react';
import * as Recharts from 'recharts';
import * as LucideIcons from 'lucide-react';
import * as FramerMotion from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Radix UI Primitives - Headless, unstyled components
// All Radix packages are imported and exposed via a single RadixUI namespace
import * as RadixAccordion from '@radix-ui/react-accordion';
import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import * as RadixAspectRatio from '@radix-ui/react-aspect-ratio';
import * as RadixAvatar from '@radix-ui/react-avatar';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import * as RadixDialog from '@radix-ui/react-dialog';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadixHoverCard from '@radix-ui/react-hover-card';
import * as RadixLabel from '@radix-ui/react-label';
import * as RadixMenubar from '@radix-ui/react-menubar';
import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';
import * as RadixPopover from '@radix-ui/react-popover';
import * as RadixProgress from '@radix-ui/react-progress';
import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import * as RadixSelect from '@radix-ui/react-select';
import * as RadixSeparator from '@radix-ui/react-separator';
import * as RadixSlider from '@radix-ui/react-slider';
import * as RadixSlot from '@radix-ui/react-slot';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as RadixTabs from '@radix-ui/react-tabs';
import * as RadixToast from '@radix-ui/react-toast';
import * as RadixToggle from '@radix-ui/react-toggle';
import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import * as RadixTooltip from '@radix-ui/react-tooltip';

// Components - Direct imports (these are actual components)
import {
  Icon,
  Button,
  Modal,
  Loading,
  Tooltip,
  Input,
  Select,
  Table,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  toast,
  Avatar,
  Banner,
  Container,
  Header,
  Progress,
  ComponentCarousel,
  ComponentTooltip,
  ToggleSwitch,
  Portal,
  FileDropzone,
  // These are namespace objects - import them separately
  Badge as BadgeNamespace,
  Card as CardNamespace,
  Chart as ChartNamespace,
  Legend as LegendNamespace,
  Text as TextNamespace,
  AiInteraction as AiInteractionNamespace,
} from '@components';

// Utils - cn for class name merging
import { cn } from '@libs/utils/react';

// Utils - Number formatting utilities
import {
  formatLargeNumber,
  formatNumber,
  calculatePercent,
  clamp,
} from '@libs/utils/number';

// Utils - String utilities
import {
  toTitleCase,
  capitalize,
  pluralize,
  camelCaseToTitleCase,
  snakeToTitleCase,
} from '@libs/utils/string';

// Utils - Date/Time utilities
import {
  dateFormatter,
  formatDate,
  formatDateFromTimestamp,
} from '@libs/utils/time';

/**
 * All Radix UI primitives bundled together
 *
 * Usage: import { Dialog, Popover } from RadixUI namespace
 * Example: <RadixUI.Dialog.Root>...</RadixUI.Dialog.Root>
 */
export const RadixUI = {
  Accordion: RadixAccordion,
  AlertDialog: RadixAlertDialog,
  AspectRatio: RadixAspectRatio,
  Avatar: RadixAvatar,
  Checkbox: RadixCheckbox,
  Collapsible: RadixCollapsible,
  ContextMenu: RadixContextMenu,
  Dialog: RadixDialog,
  DropdownMenu: RadixDropdownMenu,
  HoverCard: RadixHoverCard,
  Label: RadixLabel,
  Menubar: RadixMenubar,
  NavigationMenu: RadixNavigationMenu,
  Popover: RadixPopover,
  Progress: RadixProgress,
  RadioGroup: RadixRadioGroup,
  ScrollArea: RadixScrollArea,
  Select: RadixSelect,
  Separator: RadixSeparator,
  Slider: RadixSlider,
  Slot: RadixSlot,
  Switch: RadixSwitch,
  Tabs: RadixTabs,
  Toast: RadixToast,
  Toggle: RadixToggle,
  ToggleGroup: RadixToggleGroup,
  Tooltip: RadixTooltip,
} as const;

/**
 * The complete scope object that gets injected into compiled components.
 *
 * This maps to the factory function signature:
 * `(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion) => Component`
 */
export interface ComponentScope {
  React: typeof React;
  Components: typeof Components;
  Utils: typeof Utils;
  Recharts: typeof Recharts;
  LucideIcons: typeof LucideIcons;
  RadixUI: typeof RadixUI;
  FramerMotion: typeof FramerMotion;
}

/**
 * All component exports bundled together
 *
 * NOTE: For namespace objects (Badge, Card, etc.), we export both:
 * - The default/most-used component (e.g., Badge = BadgeNamespace.Default)
 * - The full namespace (e.g., BadgeAll = BadgeNamespace)
 */
export const Components = {
  // Core UI Components (these are direct components)
  Icon,
  Button,
  Modal,
  Loading,
  Tooltip,
  ComponentTooltip,
  Input,
  Select,
  Table,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  toast,
  Avatar,
  Banner,
  Container,
  Header,
  Progress,
  ComponentCarousel,
  ToggleSwitch,
  Portal,
  FileDropzone,

  // Badge - Default component for simple badge usage
  // Usage: <Badge value="Label" /> or <Badge value={5} />
  Badge: BadgeNamespace.Default,
  // Full namespace for specialized badges
  BadgeAll: BadgeNamespace,

  // Card - Detail card for simple card usage
  // Usage: <Card title="Title" description="..." />
  Card: CardNamespace.Detail,
  // Full namespace for specialized cards
  CardAll: CardNamespace,

  // Chart namespace (use Recharts directly for most charts)
  ChartAll: ChartNamespace,

  // Legend namespace
  LegendAll: LegendNamespace,

  // Text namespace for specialized text components
  TextAll: TextNamespace,

  // AiInteraction namespace
  AiInteractionAll: AiInteractionNamespace,

  // Markdown rendering
  // Usage: <ReactMarkdown>{markdownContent}</ReactMarkdown>
  ReactMarkdown,

  // ===== RADIX UI PRIMITIVES (Legacy - kept for backwards compatibility) =====
  // PREFER using RadixUI namespace directly: import * as Dialog from '@radix-ui/react-dialog'
  // These are exposed here for older compiled components
  Popover: RadixPopover,
  Collapsible: RadixCollapsible,
  ScrollArea: RadixScrollArea,
  RadioGroup: RadixRadioGroup,
  RadixSelect: RadixSelect,
} as const;

/**
 * Utility functions available for dynamic components
 *
 * These utilities help with common formatting and transformation tasks
 * without requiring external libraries like lodash or date-fns.
 */
export const Utils = {
  // Class name merging (Tailwind)
  cn,

  // Number formatting
  formatLargeNumber, // 1234567 → "1.2M"
  formatNumber, // 1234.5678 → "1,234.57"
  calculatePercent, // (50, 200) → 25
  clamp, // clamp(value, min, max)

  // String formatting
  toTitleCase, // "hello world" → "Hello World"
  capitalize, // "hello" → "Hello"
  pluralize, // ("item", 5) → "items"
  camelCaseToTitleCase, // "helloWorld" → "Hello World"
  snakeToTitleCase, // "hello_world" → "Hello World"

  // Date/Time formatting
  dateFormatter, // ISO string → "5 minutes ago" or "Jan 1, 2024"
  formatDate, // ISO string → "Jan 1, 2024"
  formatDateFromTimestamp, // timestamp → "Jan 1, 2024"
} as const;

/**
 * Create the complete scope for component execution
 */
export function createScope(): ComponentScope {
  return {
    React,
    Components,
    Utils,
    Recharts,
    LucideIcons,
    RadixUI,
    FramerMotion,
  };
}

/**
 * Execute a compiled component factory with the scope
 *
 * @param compiledCode - The compiled JavaScript code (factory function string)
 * @returns The React component
 *
 * @example
 * ```typescript
 * const Component = executeWithScope(compiledCode);
 * return <Component />;
 * ```
 */
export function executeWithScope(compiledCode: string): React.FC {
  try {
    const scope = createScope();

    // Create a function from the compiled code
    // The compiled code is already wrapped as a factory function
    const factory = new Function(
      'React',
      'Components',
      'Utils',
      'Recharts',
      'LucideIcons',
      'RadixUI',
      'FramerMotion',
      `"use strict"; 
       try {
         var result = (${compiledCode})(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion);
         return result;
       } catch (e) {
         throw new Error('Execution error: ' + e.message);
       }`,
    );

    // Execute with our scope
    const Component = factory(
      scope.React,
      scope.Components,
      scope.Utils,
      scope.Recharts,
      scope.LucideIcons,
      scope.RadixUI,
      scope.FramerMotion,
    );

    // Check if it's a valid React component
    // React components can be:
    // 1. Functions (function components)
    // 2. Objects with $$typeof (React.memo, React.forwardRef, etc.)
    const isValidComponent =
      typeof Component === 'function' ||
      (typeof Component === 'object' &&
        Component !== null &&
        '$$typeof' in Component);

    if (!isValidComponent) {
      throw new Error(
        `Compiled code did not return a valid React component. Got: ${typeof Component}`,
      );
    }

    return Component as React.FC;
  } catch (error) {
    // Re-throw with additional context - error will be caught by DynamicComponentRenderer
    throw error;
  }
}

/**
 * Validate that a compiled component can be executed
 *
 * @param compiledCode - The compiled JavaScript code
 * @returns Object with isValid and optional error message
 */
export function validateComponent(compiledCode: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Check for unusual characters that might cause parsing issues
    const first500 = compiledCode.substring(0, 500);
    const hasUnusualChars = first500.split('').some((c) => {
      const code = c.charCodeAt(0);
      // Flag non-ASCII or control chars (except newline, tab, etc.)
      return (
        code > 127 || (code < 32 && code !== 10 && code !== 13 && code !== 9)
      );
    });

    if (hasUnusualChars) {
      return {
        isValid: false,
        error: 'Component code contains invalid characters',
      };
    }

    // Basic syntax check - try to parse the code
    const functionBody = `"use strict"; return (${compiledCode})(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion);`;
    new Function(
      'React',
      'Components',
      'Utils',
      'Recharts',
      'LucideIcons',
      'RadixUI',
      'FramerMotion',
      functionBody,
    );

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

// Re-export library namespaces for convenience
// Note: RadixUI is already exported as a const above
export { Recharts, LucideIcons, FramerMotion };

/**
 * Comprehensive verification result for agent feedback
 */
export interface VerificationResult {
  success: boolean;
  stage: 'syntax' | 'execution' | 'render' | 'complete';
  error?: {
    type: 'SyntaxError' | 'ExecutionError' | 'RenderError' | 'TypeError';
    message: string;
    stack?: string;
    /** Hint for fixing the error */
    hint?: string;
  };
  /** Component metadata if successful */
  metadata?: {
    isValidComponent: boolean;
    componentType: 'function' | 'memo' | 'forwardRef' | 'unknown';
  };
}

/**
 * Verify a compiled component can render without issues.
 * Returns structured errors suitable for agent re-assessment.
 *
 * @param compiledCode - The compiled JavaScript code
 * @param testProps - Optional props to pass for test render
 * @returns VerificationResult with detailed error info
 *
 * @example
 * ```typescript
 * const result = verifyComponent(compiledCode);
 * if (!result.success) {
 *   // Send result.error to agent for re-assessment
 *   console.error(`${result.error.type}: ${result.error.message}`);
 *   console.log(`Hint: ${result.error.hint}`);
 * }
 * ```
 */
export function verifyComponent(
  compiledCode: string,
  testProps: Record<string, unknown> = {},
): VerificationResult {
  // Stage 1: Syntax validation
  try {
    const trimmed = compiledCode.trim();

    // Check for common issues
    if (!trimmed.startsWith('(') && !trimmed.startsWith('//')) {
      return {
        success: false,
        stage: 'syntax',
        error: {
          type: 'SyntaxError',
          message: 'Compiled code must start with a factory function',
          hint: 'Ensure the code is wrapped in (function(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion) { ... })',
        },
      };
    }

    // Try to parse as a function
    const functionBody = `"use strict"; return (${compiledCode})(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion);`;
    new Function(
      'React',
      'Components',
      'Utils',
      'Recharts',
      'LucideIcons',
      'RadixUI',
      'FramerMotion',
      functionBody,
    );
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      stage: 'syntax',
      error: {
        type: 'SyntaxError',
        message: error.message,
        stack: error.stack,
        hint: extractSyntaxHint(error.message),
      },
    };
  }

  // Stage 2: Execution validation
  let Component: React.FC;
  let componentType: 'function' | 'memo' | 'forwardRef' | 'unknown' = 'unknown';

  try {
    const scope = createScope();

    const factory = new Function(
      'React',
      'Components',
      'Utils',
      'Recharts',
      'LucideIcons',
      'RadixUI',
      'FramerMotion',
      `"use strict"; 
       try {
         var result = (${compiledCode})(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion);
         return result;
       } catch (e) {
         throw new Error('Factory execution error: ' + e.message);
       }`,
    );

    Component = factory(
      scope.React,
      scope.Components,
      scope.Utils,
      scope.Recharts,
      scope.LucideIcons,
      scope.RadixUI,
      scope.FramerMotion,
    );

    // Check component validity
    if (typeof Component === 'function') {
      componentType = 'function';
    } else if (
      typeof Component === 'object' &&
      Component !== null &&
      '$$typeof' in Component
    ) {
      // React.memo or React.forwardRef
      const typeOf = (Component as { $$typeof: symbol }).$$typeof;
      if (typeOf === Symbol.for('react.memo')) {
        componentType = 'memo';
      } else if (typeOf === Symbol.for('react.forward_ref')) {
        componentType = 'forwardRef';
      }
    } else {
      return {
        success: false,
        stage: 'execution',
        error: {
          type: 'TypeError',
          message: `Expected a React component but got: ${typeof Component}`,
          hint: 'Ensure the component has "export default ComponentName" or "export default React.memo(ComponentName)"',
        },
      };
    }
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      stage: 'execution',
      error: {
        type: 'ExecutionError',
        message: error.message,
        stack: error.stack,
        hint: extractExecutionHint(error.message),
      },
    };
  }

  // Stage 3: Test render (catches runtime errors like invalid JSX elements)
  try {
    // Create a minimal render test using React.createElement
    // This catches errors like "Element type is invalid"
    const element = React.createElement(Component, testProps);

    // Basic validation - check the element was created
    if (!element || typeof element !== 'object') {
      throw new Error('Component did not return a valid React element');
    }
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      stage: 'render',
      error: {
        type: 'RenderError',
        message: error.message,
        stack: error.stack,
        hint: extractRenderHint(error.message),
      },
    };
  }

  // All stages passed
  return {
    success: true,
    stage: 'complete',
    metadata: {
      isValidComponent: true,
      componentType,
    },
  };
}

/**
 * Extract a helpful hint from syntax errors
 */
function extractSyntaxHint(message: string): string {
  if (message.includes('Unexpected token')) {
    return 'Check for missing brackets, parentheses, or commas near the error location';
  }
  if (message.includes('Unexpected identifier')) {
    return 'Check for missing semicolons or incorrect variable declarations';
  }
  if (message.includes('Unexpected end of input')) {
    return 'Check for unclosed brackets, braces, or template literals';
  }
  return 'Review the syntax near the reported error location';
}

/**
 * Extract a helpful hint from execution errors
 */
function extractExecutionHint(message: string): string {
  if (message.includes('is not defined')) {
    const match = message.match(/(\w+) is not defined/);
    if (match) {
      return `"${match[1]}" is not available. Check ALLOWED_IMPORTS_GUIDE.md for available imports`;
    }
  }
  if (message.includes('is not a function')) {
    return 'Check that you are calling functions correctly and they exist in the allowed imports';
  }
  if (message.includes('Cannot read properties of undefined')) {
    return 'Check that all imported modules and their properties exist';
  }
  return 'Check the component code for undefined variables or incorrect imports';
}

/**
 * Extract a helpful hint from render errors
 */
function extractRenderHint(message: string): string {
  if (message.includes('Element type is invalid')) {
    if (message.includes('got: object')) {
      return 'A component is being used as an object instead of a function. Check that all imported components are actual React components, not namespace objects';
    }
    if (message.includes('got: undefined')) {
      return 'A component is undefined. Check that all component names are spelled correctly and imported';
    }
  }
  if (message.includes('is not a valid React child')) {
    return 'Check that you are not trying to render an object directly. Use JSON.stringify() or map over arrays';
  }
  if (message.includes('Each child in a list should have a unique "key"')) {
    return 'Add unique key props to elements rendered in a loop';
  }
  return 'Check component JSX for invalid element types or children';
}
