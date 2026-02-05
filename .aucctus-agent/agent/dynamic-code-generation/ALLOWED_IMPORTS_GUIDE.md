# Allowed Imports for Dynamic Components

**CRITICAL**: Only these imports work in dynamically compiled components. External libraries not listed here cause runtime errors.

---

## React

```tsx
import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useRef, 
  memo, 
  Fragment,
  useContext,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useTransition,
  useId,
  useSyncExternalStore,
  useInsertionEffect
} from 'react';
```

**Available hooks**: All React hooks are available
**Available utilities**: `memo`, `Fragment`, `Suspense`, `lazy`, `forwardRef`, `createContext`, `createElement`

---

## lucide-react Icons

**All Lucide icons are available.** Import only what you need:

```tsx
import { 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Clock,
  User,
  Users,
  Mail,
  Phone,
  MapPin,
  Globe,
  Home,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  Save,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  Loader2,
  RefreshCw,
  MoreVertical,
  MoreHorizontal,
  Menu,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
```

### Icon Usage

```tsx
// Basic icon with size and color (using existing tokens)
<Check className="h-5 w-5 text-success-600" />

// Icon with hover state
<Settings className="h-6 w-6 text-gray-light-600 hover:text-purple-600 transition-colors" />

// Loading spinner
<Loader2 className="h-5 w-5 text-purple-600 animate-spin-slow" />

// Icon in button
<button className="flex items-center gap-2">
  <Plus className="h-4 w-4" />
  Add Item
</button>
```

### Common Icon Sizes
- `h-3 w-3` - Extra small (12px)
- `h-4 w-4` - Small (16px) - buttons, inline
- `h-5 w-5` - Medium (20px) - standard
- `h-6 w-6` - Large (24px) - headers
- `h-8 w-8` - Extra large (32px) - feature icons

### Color with Existing Tokens
Always use existing color tokens from tailwind.config.js:
- Success: `text-success-500`, `text-success-600`
- Error: `text-error-500`, `text-error-600`
- Warning: `text-warning-500`, `text-warning-600`
- Info: `text-blue-500`, `text-blue-600`
- Brand: `text-purple-500`, `text-purple-600`
- Neutral: `text-gray-light-600`, `text-gray-light-700`, `text-primary-600`

---

## framer-motion

```tsx
import { 
  motion, 
  AnimatePresence,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useDragControls,
  useAnimationControls
} from 'framer-motion';
```

### Motion Components

```tsx
// Entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Exit animation with AnimatePresence
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>

// Hover and tap gestures
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

// Staggered list
<motion.ul
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Hooks

```tsx
// Scroll-based animation
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

// In-view detection
const ref = useRef(null);
const isInView = useInView(ref, { once: true });

// Programmatic control
const controls = useAnimation();
await controls.start({ opacity: 1 });
```

---

## Radix UI Primitives

All Radix UI packages are available. Import as namespaces:

```tsx
// Dialog
import * as Dialog from '@radix-ui/react-dialog';

// Popover
import * as Popover from '@radix-ui/react-popover';

// Dropdown Menu
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// Select
import * as Select from '@radix-ui/react-select';

// Accordion
import * as Accordion from '@radix-ui/react-accordion';

// Tabs
import * as Tabs from '@radix-ui/react-tabs';

// Tooltip
import * as Tooltip from '@radix-ui/react-tooltip';

// Collapsible
import * as Collapsible from '@radix-ui/react-collapsible';

// Checkbox
import * as Checkbox from '@radix-ui/react-checkbox';

// Radio Group
import * as RadioGroup from '@radix-ui/react-radio-group';

// Switch
import * as Switch from '@radix-ui/react-switch';

// Slider
import * as Slider from '@radix-ui/react-slider';

// Progress
import * as Progress from '@radix-ui/react-progress';

// Scroll Area
import * as ScrollArea from '@radix-ui/react-scroll-area';

// Separator
import * as Separator from '@radix-ui/react-separator';

// Avatar
import * as Avatar from '@radix-ui/react-avatar';

// Alert Dialog
import * as AlertDialog from '@radix-ui/react-alert-dialog';

// Context Menu
import * as ContextMenu from '@radix-ui/react-context-menu';

// Hover Card
import * as HoverCard from '@radix-ui/react-hover-card';

// Menubar
import * as Menubar from '@radix-ui/react-menubar';

// Navigation Menu
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

// Toast
import * as Toast from '@radix-ui/react-toast';

// Toggle
import * as Toggle from '@radix-ui/react-toggle';

// Toggle Group
import * as ToggleGroup from '@radix-ui/react-toggle-group';

// Label
import * as Label from '@radix-ui/react-label';

// Aspect Ratio
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

// Slot
import * as Slot from '@radix-ui/react-slot';
```

**IMPORTANT**: Radix components are headless (unstyled). You must style them with existing Tailwind tokens. See base-component-creation-guide.md for wrapper patterns.

---

## @components (Aucctus Components)

```tsx
import {
  // Layout
  Container,
  Portal,
  Banner,
  Header,
  
  // UI
  Button,
  Modal,
  Loading,
  Progress,
  Tooltip as AucctusTooltip,
  ComponentTooltip,
  toast,
  
  // Forms
  Input,
  Select as AucctusSelect,
  ToggleSwitch,
  
  // Data
  Table,
  Badge,
  
  // Tabs
  Tabs as AucctusTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  
  // Other
  Avatar,
  ComponentCarousel,
  FileDropzone,
  ReactMarkdown
} from '@components';
```

**Note**: Some Aucctus components have Radix equivalents. Prefer Radix + custom wrappers for new components.

**Important**: To avoid naming conflicts with Radix UI, Aucctus components that share names are prefixed:
- `AucctusTabs`, `AucctusTabsList`, `AucctusTabsTrigger`, `AucctusTabsContent` (not `Tabs`)
- `AucctusTooltip` (not `Tooltip`)
- `AucctusSelect` (not `Select`)
- `AucctusProgress` (not `Progress`)
- `AucctusAvatar` (not `Avatar`)

This allows you to use `import * as Tabs from '@radix-ui/react-tabs'` without conflicts.

### Toast Usage

```tsx
toast.success('Operation successful');
toast.error('Error title', 'Error description');
toast.warning('Warning message');
toast.info('Information message');
```

---

## @libs/utils/react

```tsx
import { cn } from '@libs/utils/react';
```

**cn utility**: Merges Tailwind classes with conditional logic

```tsx
<div className={cn(
  'bg-gray-light-50 rounded-lg p-4',
  isActive && 'bg-purple-100',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className
)} />
```

---

## Runtime Utilities

These utilities are available directly without imports:

### Number Formatting

```tsx
formatLargeNumber(1234567)        // "1.2M"
formatNumber(1234.5678, 2)        // "1,234.57"
calculatePercent(50, 200)         // 25
clamp(value, min, max)            // Clamps value between min and max
```

### String Formatting

```tsx
toTitleCase("hello world")        // "Hello World"
capitalize("hello")               // "Hello"
pluralize("item", 5)              // "items"
camelCaseToTitleCase("helloWorld") // "Hello World"
snakeToTitleCase("hello_world")   // "Hello World"
```

### Date Formatting

```tsx
dateFormatter("2024-01-15T10:30:00Z")     // "5 minutes ago" or "Jan 15, 2024"
formatDate("2024-01-15T10:30:00Z")        // "Jan 15, 2024"
formatDateFromTimestamp(1705318200000)    // "Jan 15, 2024"
```

---

## recharts

```tsx
import {
  // Containers
  ResponsiveContainer,
  
  // Chart Types
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ScatterChart,
  RadarChart,
  RadialBarChart,
  ComposedChart,
  Treemap,
  Sankey,
  FunnelChart,
  
  // Chart Elements
  Line,
  Bar,
  Pie,
  Area,
  Scatter,
  Radar,
  RadialBar,
  Funnel,
  Cell,
  
  // Axes
  XAxis,
  YAxis,
  ZAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  
  // Decorations
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Brush,
  LabelList
} from 'recharts';
```

### Chart Usage

```tsx
<div className="h-64 w-full">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
      <XAxis dataKey="name" stroke="currentColor" />
      <YAxis stroke="currentColor" />
      <RechartsTooltip />
      <Bar dataKey="value" fill="#7c3aed" />
    </BarChart>
  </ResponsiveContainer>
</div>
```

**Use existing color tokens**: `#7c3aed` (purple-600), `#17B26A` (success-500), `#DB4D54` (error-500)

---

## ❌ FORBIDDEN Imports

These libraries are **NOT available** and will cause runtime errors:

| Don't Use | Use Instead |
|-----------|-------------|
| Old `Icon` component from `@components` | `lucide-react` icons |
| `react-icons` | `lucide-react` |
| `@heroicons/react` | `lucide-react` |
| `lodash` | Native JavaScript methods |
| `moment` | Runtime utilities: `dateFormatter()`, `formatDate()` |
| `date-fns` | Runtime utilities: `dateFormatter()`, `formatDate()` |
| `axios` | Native `fetch()` |
| `classnames` | `cn()` from `@libs/utils/react` |
| `clsx` | `cn()` from `@libs/utils/react` |
| `react-spring` | `framer-motion` |
| `gsap` | `framer-motion` or Tailwind animations |
| `anime.js` | `framer-motion` or Tailwind animations |

---

## Quick Reference

| Need | Solution |
|------|----------|
| Icons | `import { Check } from 'lucide-react'` → `<Check className="h-5 w-5 text-success-600" />` |
| Animations | `framer-motion` for complex, Tailwind classes for simple |
| Dates | `dateFormatter(isoString)` |
| Numbers | `formatLargeNumber(1500000)` → "1.5M" |
| Classes | `cn('base', { 'conditional': bool })` |
| Toasts | `toast.success('Message')` |
| Markdown | `<ReactMarkdown>{text}</ReactMarkdown>` |
| Dialogs | Wrap `@radix-ui/react-dialog` with existing tokens |
| Charts | `recharts` with existing color tokens |

---

## Validation Checklist

Before submitting generated components, verify:

- [ ] No old `Icon` component from `@components`
- [ ] All icons are from `lucide-react`
- [ ] All colors use existing tokens from `tailwind.config.js`
- [ ] No arbitrary Tailwind values (e.g., `text-[#abc123]`)
- [ ] Animations use either `framer-motion` or existing Tailwind classes
- [ ] Radix components are properly wrapped and styled
- [ ] No forbidden libraries imported
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
