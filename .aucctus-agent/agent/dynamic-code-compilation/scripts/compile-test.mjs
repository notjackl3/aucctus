#!/usr/bin/env node
/**
 * Test script to compile a TSX component for dynamic rendering
 * 
 * Usage: node scripts/compile-test.mjs <path-to-tsx>
 * Example: node scripts/compile-test.mjs ../src/app/pages/GymsharkFeasibility/GymsharkFeasibility.tsx
 * 
 * IMPORTANT: Keep this in sync with:
 * - compiler/compile.ts (the main compiler)
 * - src/app/components/DynamicComponent/scopeRegistry.ts (runtime scope)
 */

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * esbuild plugin that intercepts external imports and replaces them
 * with references to scope variables that will be injected at runtime.
 */
const scopeInjectionPlugin = {
  name: 'scope-injection',
  setup(build) {
    // Match all external packages we handle
    const externalPattern = /^(react|recharts|react-markdown|lucide-react|framer-motion|@radix-ui|@components|@libs)/;

    build.onResolve({ filter: externalPattern }, (args) => {
      return {
        path: args.path,
        namespace: 'scope-inject',
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'scope-inject' }, (args) => {
      let scopeVar = 'Components';

      if (args.path === 'react') {
        scopeVar = 'React';
      } else if (args.path === 'react-markdown') {
        // react-markdown is available via Components.ReactMarkdown
        return {
          contents: `module.exports = { default: Components.ReactMarkdown };`,
          loader: 'js',
        };
      } else if (args.path.startsWith('@radix-ui/react-')) {
        // Handle all @radix-ui/react-* packages dynamically
        // Extract component name: @radix-ui/react-dialog -> Dialog
        const packageName = args.path.replace('@radix-ui/react-', '');
        // Convert kebab-case to PascalCase: alert-dialog -> AlertDialog
        const componentName = packageName
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        return {
          contents: `module.exports = RadixUI.${componentName};`,
          loader: 'js',
        };
      } else if (args.path === 'lucide-react') {
        // Lucide icons are available as a separate scope variable
        return {
          contents: `module.exports = LucideIcons;`,
          loader: 'js',
        };
      } else if (args.path === 'framer-motion') {
        // Framer Motion is available as a separate scope variable
        return {
          contents: `module.exports = FramerMotion;`,
          loader: 'js',
        };
      } else if (args.path === 'react/jsx-runtime' || args.path === 'react/jsx-dev-runtime') {
        // JSX runtime - provide jsx/jsxs functions that wrap createElement
        // The jsx transform uses: jsx(type, props, key) where props contains children
        // We need to convert this to createElement(type, props, ...children)
        return {
          contents: `
            var jsx = function(type, props, key) {
              if (props && props.children !== undefined) {
                var children = props.children;
                var newProps = {};
                for (var k in props) {
                  if (k !== 'children') newProps[k] = props[k];
                }
                if (key !== undefined) newProps.key = key;
                if (Array.isArray(children)) {
                  return React.createElement.apply(React, [type, newProps].concat(children));
                } else {
                  return React.createElement(type, newProps, children);
                }
              }
              if (key !== undefined) {
                var propsWithKey = props ? Object.assign({}, props, { key: key }) : { key: key };
                return React.createElement(type, propsWithKey);
              }
              return React.createElement(type, props);
            };
            module.exports = { jsx: jsx, jsxs: jsx, Fragment: React.Fragment };
          `,
          loader: 'js',
        };
      } else if (args.path === 'recharts') {
        scopeVar = 'Recharts';
      } else if (args.path === '@components' || args.path.startsWith('@components/')) {
        scopeVar = 'Components';
      } else if (args.path === '@libs/utils/react' || args.path.startsWith('@libs/')) {
        scopeVar = 'Utils';
      }

      return {
        contents: `module.exports = ${scopeVar};`,
        loader: 'js',
      };
    });
  },
};

/**
 * Wraps the compiled code in a factory function
 * 
 * IMPORTANT: Keep this in sync with:
 * - compiler/compile.ts (wrapWithScopeInjection function)
 * - src/app/components/DynamicComponent/scopeRegistry.ts (Components and Utils exports)
 */
function wrapWithScopeInjection(compiledCode, globalName) {
  return `
// Agent-compiled component - ${new Date().toISOString()}
// This code expects scope injection at runtime
(function(React, Components, Utils, Recharts, LucideIcons, RadixUI, FramerMotion) {
  "use strict";
  
  // ===== REACT =====
  // Hooks
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;
  var useCallback = React.useCallback;
  var useRef = React.useRef;
  var useContext = React.useContext;
  var useReducer = React.useReducer;
  var useLayoutEffect = React.useLayoutEffect;
  var useImperativeHandle = React.useImperativeHandle;
  var useDebugValue = React.useDebugValue;
  var useDeferredValue = React.useDeferredValue;
  var useTransition = React.useTransition;
  var useId = React.useId;
  var useSyncExternalStore = React.useSyncExternalStore;
  var useInsertionEffect = React.useInsertionEffect;
  
  // Component utilities
  var Fragment = React.Fragment;
  var Suspense = React.Suspense;
  var lazy = React.lazy;
  var memo = React.memo;
  var forwardRef = React.forwardRef;
  var createContext = React.createContext;
  var createElement = React.createElement;
  
  // ===== UTILS =====
  // Class name merging
  var cn = Utils.cn;
  
  // Number formatting
  var formatLargeNumber = Utils.formatLargeNumber;
  var formatNumber = Utils.formatNumber;
  var calculatePercent = Utils.calculatePercent;
  var clamp = Utils.clamp;
  
  // String formatting
  var toTitleCase = Utils.toTitleCase;
  var capitalize = Utils.capitalize;
  var pluralize = Utils.pluralize;
  var camelCaseToTitleCase = Utils.camelCaseToTitleCase;
  var snakeToTitleCase = Utils.snakeToTitleCase;
  
  // Date/Time formatting
  var dateFormatter = Utils.dateFormatter;
  var formatDate = Utils.formatDate;
  var formatDateFromTimestamp = Utils.formatDateFromTimestamp;
  
  // ===== COMPONENTS =====
  // Core UI
  var Icon = Components.Icon;
  var Button = Components.Button;
  var Modal = Components.Modal;
  var Loading = Components.Loading;
  var AucctusProgress = Components.Progress;
  var AucctusTooltip = Components.Tooltip;
  var ComponentTooltip = Components.ComponentTooltip;
  var toast = Components.toast;
  
  // Form elements
  var Input = Components.Input;
  var AucctusSelect = Components.Select;
  var ToggleSwitch = Components.ToggleSwitch;
  
  // Layout
  var Container = Components.Container;
  var Portal = Components.Portal;
  var AucctusAvatar = Components.Avatar;
  var Banner = Components.Banner;
  var Header = Components.Header;
  
  // Tabs (Aucctus components - use AucctusTabs to avoid conflict with Radix Tabs)
  var AucctusTabs = Components.Tabs;
  var AucctusTabsList = Components.TabsList;
  var AucctusTabsTrigger = Components.TabsTrigger;
  var AucctusTabsContent = Components.TabsContent;
  
  // Table
  var Table = Components.Table;
  
  // Badge - default simple badge component
  // Usage: <Badge value="Label" /> or <Badge value={5} />
  var Badge = Components.Badge;
  // Full badge namespace for specialized badges (Badge.RiskLevel, Badge.Stage, etc.)
  var BadgeAll = Components.BadgeAll;
  
  // Card - default detail card component
  var Card = Components.Card;
  // Full card namespace for specialized cards
  var CardAll = Components.CardAll;
  
  // Other components
  var ComponentCarousel = Components.ComponentCarousel;
  var FileDropzone = Components.FileDropzone;
  
  // Markdown rendering
  // Usage: <ReactMarkdown>{markdownContent}</ReactMarkdown>
  var ReactMarkdown = Components.ReactMarkdown;
  
  // ===== RADIX UI PRIMITIVES (Legacy - for backwards compatibility) =====
  // PREFER using RadixUI namespace directly: import * as Dialog from '@radix-ui/react-dialog'
  var Popover = Components.Popover;
  var Collapsible = Components.Collapsible;
  var ScrollArea = Components.ScrollArea;
  var RadioGroup = Components.RadioGroup;
  var RadixSelect = Components.RadixSelect;
  
  // ===== RECHARTS =====
  // Container
  var ResponsiveContainer = Recharts.ResponsiveContainer;
  
  // Chart types
  var LineChart = Recharts.LineChart;
  var BarChart = Recharts.BarChart;
  var PieChart = Recharts.PieChart;
  var AreaChart = Recharts.AreaChart;
  var ScatterChart = Recharts.ScatterChart;
  var RadarChart = Recharts.RadarChart;
  var RadialBarChart = Recharts.RadialBarChart;
  var ComposedChart = Recharts.ComposedChart;
  var Treemap = Recharts.Treemap;
  var Sankey = Recharts.Sankey;
  var FunnelChart = Recharts.FunnelChart;
  
  // Chart elements
  var Line = Recharts.Line;
  var Bar = Recharts.Bar;
  var Pie = Recharts.Pie;
  var Area = Recharts.Area;
  var Scatter = Recharts.Scatter;
  var Radar = Recharts.Radar;
  var RadialBar = Recharts.RadialBar;
  var Funnel = Recharts.Funnel;
  var Cell = Recharts.Cell;
  
  // Axes
  var XAxis = Recharts.XAxis;
  var YAxis = Recharts.YAxis;
  var ZAxis = Recharts.ZAxis;
  var PolarGrid = Recharts.PolarGrid;
  var PolarAngleAxis = Recharts.PolarAngleAxis;
  var PolarRadiusAxis = Recharts.PolarRadiusAxis;
  
  // Decorations
  var CartesianGrid = Recharts.CartesianGrid;
  var RechartsTooltip = Recharts.Tooltip;
  var RechartsLegend = Recharts.Legend;
  var ReferenceLine = Recharts.ReferenceLine;
  var ReferenceArea = Recharts.ReferenceArea;
  var ReferenceDot = Recharts.ReferenceDot;
  var Brush = Recharts.Brush;
  var LabelList = Recharts.LabelList;
  
  // ===== LUCIDE ICONS =====
  // All 1000+ Lucide icons are available via LucideIcons namespace
  // Import like: import { Check, X, ChevronDown } from 'lucide-react'
  // The compiled code automatically destructures from LucideIcons
  
  // ===== RADIX UI =====
  // All Radix UI primitives are available via RadixUI namespace
  // Import like: import * as Dialog from '@radix-ui/react-dialog'
  // Maps to RadixUI.Dialog, RadixUI.Popover, etc.
  
  // ===== FRAMER MOTION =====
  // All Framer Motion exports are available via FramerMotion namespace
  // Import like: import { motion, AnimatePresence } from 'framer-motion'
  // The compiled code automatically destructures from FramerMotion
  
  ${compiledCode}
  
  return ${globalName}.default || ${globalName};
})
`.trim();
}

async function compileComponent(inputPath, outputPath) {
  const startTime = Date.now();
  const globalName = '__AgentComponent__';

  console.log(`\n📦 Compiling: ${inputPath}`);

  try {
    const result = await esbuild.build({
      entryPoints: [inputPath],
      bundle: true,
      format: 'iife',
      globalName,
      platform: 'browser',
      target: ['es2020'],
      minify: false,
      plugins: [scopeInjectionPlugin],
      write: false,
      logLevel: 'warning',
    });

    const compiledCode = result.outputFiles[0].text;
    const wrappedCode = wrapWithScopeInjection(compiledCode, globalName);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, wrappedCode, 'utf8');

    const compileTime = Date.now() - startTime;
    const originalSize = fs.statSync(inputPath).size;
    const compiledSize = Buffer.byteLength(wrappedCode, 'utf8');

    console.log(`✅ Compiled successfully!`);
    console.log(`   📄 Output: ${outputPath}`);
    console.log(`   ⏱️  Time: ${compileTime}ms`);
    console.log(`   📊 Size: ${(originalSize / 1024).toFixed(1)}KB → ${(compiledSize / 1024).toFixed(1)}KB`);

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      result.warnings.forEach(w => console.log(`   - ${w.text}`));
    }

    return { success: true, outputPath, compileTime };
  } catch (error) {
    console.error(`❌ Compilation failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
const inputPath = process.argv[2];
if (!inputPath) {
  console.log('Usage: node scripts/compile-test.mjs <path-to-tsx>');
  console.log('Example: node scripts/compile-test.mjs ../../../../src/app/pages/GymsharkFeasibility/GymsharkFeasibility.tsx');
  process.exit(1);
}

// Project root is 4 levels up from scripts/ directory
// .aucctus-agent/agent/dynamic-code-compilation/scripts/ -> ../../../../ -> project root
const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const absoluteInputPath = path.resolve(__dirname, '..', inputPath);
const componentName = path.basename(inputPath, '.tsx');
const outputPath = path.resolve(projectRoot, 'public', 'compiled', `${componentName}.js`);

compileComponent(absoluteInputPath, outputPath);
