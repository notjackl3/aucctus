# Base Component Creation Guide

Your **core vocabulary** for creating dynamic components in Aucctus using modern patterns with lucide-react, framer-motion, and Radix UI.

---

## Quick Reference

```tsx
// Modern component with framer-motion and lucide-react
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { cn } from '@libs/utils/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-gray-light-50 dark:bg-gray-dark-950 rounded-lg border border-gray-light-300 dark:border-gray-dark-700 p-6"
>
  <Sparkles className="h-5 w-5 text-purple-600" />
  <h2 className="text-xl font-semibold text-primary-900 dark:text-gray-dark-50">Title</h2>
  <p className="text-sm text-gray-light-600 dark:text-gray-dark-400">Description</p>
</motion.div>
```

---

## Component Template

```typescript
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@libs/utils/react';

interface ComponentNameProps {
  data: DataType;
  variant?: 'primary' | 'secondary';
  className?: string;
  onAction?: (id: string) => void;
}

/**
 * ComponentName - Brief description
 * 
 * @param data - The data to display
 * @param variant - Visual variant (default: 'primary')
 * @param className - Additional CSS classes
 * @param onAction - Callback when action is triggered
 */
const ComponentName: React.FC<ComponentNameProps> = ({
  data,
  variant = 'primary',
  className,
  onAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Memoize expensive computations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formatted: formatLargeNumber(item.value)
    }));
  }, [data]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-gray-light-50 dark:bg-gray-dark-950 rounded-lg p-6',
        'border border-gray-light-300 dark:border-gray-dark-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-primary-900 dark:text-gray-dark-50">
            Title
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-md hover:bg-gray-light-100 dark:hover:bg-gray-dark-800 transition-colors"
          aria-expanded={isExpanded}
        >
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-light-600 dark:text-gray-dark-400 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Content */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(ComponentName);
```

---

## Styling with Existing Tokens

**CRITICAL**: Only use existing design tokens from `tailwind.config.js`. No new colors, shadows, or animations.

### Color Tokens

All colors must come from `tailwind.config.js`. Here are the available palettes:

#### Gray (Neutral)
```tsx
// Light mode
'bg-gray-light-10'   // Lightest
'bg-gray-light-50'   // Very light
'bg-gray-light-100'  // Light
'bg-gray-light-200'  // Light-medium
'bg-gray-light-300'  // Medium
'bg-gray-light-400'  // Medium-dark
'bg-gray-light-600'  // Dark
'bg-gray-light-900'  // Darkest

// Dark mode (use with dark: prefix)
'dark:bg-gray-dark-950'  // Darkest
'dark:bg-gray-dark-900'  // Very dark
'dark:bg-gray-dark-800'  // Dark
'dark:bg-gray-dark-700'  // Dark-medium
'dark:bg-gray-dark-400'  // Medium
'dark:bg-gray-dark-200'  // Light-medium
'dark:bg-gray-dark-50'   // Lightest
```

#### Primary (Neutral Alternative)
```tsx
'bg-primary-50'   // Lightest
'bg-primary-100'  // Very light
'bg-primary-300'  // Medium
'bg-primary-600'  // Dark
'bg-primary-900'  // Darkest

'text-primary-900'  // Main text (light mode)
'text-primary-600'  // Secondary text
```

#### Brand (Purple)
```tsx
'bg-purple-50'   // Very light purple
'bg-purple-100'  // Light purple
'bg-purple-200'  // Light-medium purple
'bg-purple-400'  // Medium purple
'bg-purple-500'  // Standard purple
'bg-purple-600'  // Dark purple (primary brand)
'bg-purple-700'  // Darker purple
'bg-purple-900'  // Darkest purple

'text-purple-600'  // Brand text
'border-purple-500'  // Brand border
```

#### Semantic Colors

**Success (Green)**
```tsx
'bg-success-50'   // Very light green
'bg-success-100'  // Light green
'bg-success-500'  // Standard green
'bg-success-600'  // Dark green

'text-success-600'  // Success text
```

**Error (Red)**
```tsx
'bg-error-50'   // Very light red
'bg-error-100'  // Light red
'bg-error-500'  // Standard red
'bg-error-600'  // Dark red

'text-error-600'  // Error text
```

**Warning (Orange/Yellow)**
```tsx
'bg-warning-50'   // Very light yellow
'bg-warning-100'  // Light yellow
'bg-warning-500'  // Standard orange
'bg-warning-600'  // Dark orange

'text-warning-600'  // Warning text
```

**Info (Blue)**
```tsx
'bg-blue-50'   // Very light blue
'bg-blue-100'  // Light blue
'bg-blue-500'  // Standard blue
'bg-blue-600'  // Dark blue

'text-blue-600'  // Info text
```

### Typography

```tsx
// Font family (already applied globally)
'font-primary'  // Inter font

// Text sizes (use Tailwind defaults)
'text-xs'    // 12px
'text-sm'    // 14px
'text-base'  // 16px
'text-lg'    // 18px
'text-xl'    // 20px
'text-2xl'   // 24px
'text-3xl'   // 30px

// Font weights
'font-normal'    // 400
'font-medium'    // 500
'font-semibold'  // 600
'font-bold'      // 700
```

### Spacing

Use Tailwind's default spacing scale:

```tsx
'p-2'   // 0.5rem (8px)
'p-4'   // 1rem (16px)
'p-6'   // 1.5rem (24px)
'p-8'   // 2rem (32px)

'gap-2'   // 0.5rem
'gap-4'   // 1rem
'gap-6'   // 1.5rem

'space-y-4'  // Vertical spacing between children
'space-x-4'  // Horizontal spacing between children
```

### Border Radius

Use existing border radius tokens:

```tsx
'rounded-none'  // 0
'rounded-sm'    // 0.125rem
'rounded-md'    // 0.25rem
'rounded-lg'    // 0.5rem
'rounded-xl'    // 1rem
'rounded-2xl'   // 2rem
'rounded-full'  // 9999px
```

### Shadows

Use Tailwind's default shadows:

```tsx
'shadow-sm'   // Small shadow
'shadow'      // Default shadow
'shadow-md'   // Medium shadow
'shadow-lg'   // Large shadow
'shadow-xl'   // Extra large shadow
```

---

## lucide-react Icons

**Replace all old Icon components with lucide-react.**

### Basic Usage

```tsx
import { Check, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

// Standard icon
<Check className="h-5 w-5 text-success-600" />

// Icon with hover
<Settings className="h-5 w-5 text-gray-light-600 hover:text-purple-600 transition-colors" />

// Loading spinner
<Loader2 className="h-5 w-5 text-purple-600 animate-spin-slow" />
```

### Common Icon Mappings

Old Aucctus Icon → lucide-react equivalent:

| Old | New (lucide-react) |
|-----|-------------------|
| `variant="check"` | `<Check />` |
| `variant="closeX"` | `<X />` |
| `variant="alert-circle"` | `<AlertCircle />` |
| `variant="alert-triangle"` | `<AlertTriangle />` |
| `variant="help-circle"` | `<HelpCircle />` |
| `variant="sparkles"` | `<Sparkles />` |
| `variant="trending-up"` | `<TrendingUp />` |
| `variant="trending-down"` | `<TrendingDown />` |
| `variant="barchart"` | `<BarChart3 />` |
| `variant="line-chart-up"` | `<LineChart />` |
| `variant="pie-chart"` | `<PieChart />` |
| `variant="calendar"` | `<Calendar />` |
| `variant="clock"` | `<Clock />` |
| `variant="user-group"` | `<Users />` |
| `variant="mail"` | `<Mail />` |
| `variant="globe"` | `<Globe />` |
| `variant="home"` | `<Home />` |
| `variant="gear"` | `<Settings />` |
| `variant="search-md"` | `<Search />` |
| `variant="filter-lines"` | `<Filter />` |
| `variant="download"` | `<Download />` |
| `variant="upload"` | `<Upload />` |
| `variant="edit"` | `<Edit />` |
| `variant="trash"` | `<Trash2 />` |
| `variant="plus"` | `<Plus />` |
| `variant="minus"` | `<Minus />` |
| `variant="save"` | `<Save />` |
| `variant="eye"` | `<Eye />` |
| `variant="eye-off"` | `<EyeOff />` |
| `variant="chevrondown"` | `<ChevronDown />` |
| `variant="chevronup"` | `<ChevronUp />` |
| `variant="chevronleft"` | `<ChevronLeft />` |
| `variant="chevronright"` | `<ChevronRight />` |
| `variant="arrowup"` | `<ArrowUp />` |
| `variant="arrowdown"` | `<ArrowDown />` |
| `variant="arrowleft"` | `<ArrowLeft />` |
| `variant="arrowright"` | `<ArrowRight />` |

### Icon Sizes

```tsx
<Check className="h-3 w-3" />  // 12px - Extra small
<Check className="h-4 w-4" />  // 16px - Small (buttons, inline)
<Check className="h-5 w-5" />  // 20px - Standard
<Check className="h-6 w-6" />  // 24px - Large (headers)
<Check className="h-8 w-8" />  // 32px - Extra large (features)
```

### Icon Colors

Always use existing color tokens:

```tsx
// Semantic colors
<Check className="h-5 w-5 text-success-600" />
<AlertCircle className="h-5 w-5 text-error-600" />
<AlertTriangle className="h-5 w-5 text-warning-600" />
<Info className="h-5 w-5 text-blue-600" />

// Brand
<Sparkles className="h-5 w-5 text-purple-600" />

// Neutral
<Settings className="h-5 w-5 text-gray-light-600" />
<User className="h-5 w-5 text-primary-600" />
```

---

## Animation Patterns

### When to Use Each System

**Use framer-motion for:**
- Mount/unmount animations (AnimatePresence)
- Complex animation sequences
- Gesture interactions (drag, swipe, hover, tap)
- Scroll-linked animations
- Precise animation control

**Use Tailwind classes for:**
- Simple hover/focus states
- Basic transitions (color, opacity, transform)
- Loading spinners
- Simple fade/slide effects

### framer-motion Examples

#### Entrance Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  Content
</motion.div>
```

#### Exit Animation

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

#### Staggered List

```tsx
<motion.ul
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

#### Gesture Interactions

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-purple-600 text-white px-4 py-2 rounded-lg"
>
  Click me
</motion.button>
```

#### Scroll-based Animation

```tsx
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

<motion.div style={{ opacity }}>
  Fades out on scroll
</motion.div>
```

### Tailwind Animation Classes

Use existing animations from `tailwind.config.js`:

```tsx
// Fade
'animate-fade-in'           // Fade in (200ms)
'animate-fade-out'          // Fade out (200ms)
'animate-fade-oscillation'  // Continuous pulse (3s)

// Slide
'animate-slide-in-top'
'animate-slide-in-bottom'
'animate-slide-in-left'
'animate-slide-in-right'
'animate-slide-out-left'
'animate-slide-out-right'

// Combined
'animate-fade-slide-in-right'
'animate-fade-slide-out-right'

// Expand/collapse
'animate-expand'
'animate-collapse'

// Looping
'animate-spin-slow'      // Slow spinner (3s)
'animate-pulse-subtle'   // Subtle pulse (2s)
'animate-float-subtle'   // Floating motion (2s)

// Feedback
'animate-shake'          // Error shake (300ms)
```

### Tailwind Transitions

```tsx
// Color transitions
<button className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200">
  Hover me
</button>

// Transform transitions
<div className="hover:scale-105 transition-transform duration-200">
  Scale up
</div>

// Multiple properties
<div className="transition-all duration-300 ease-out hover:shadow-lg hover:scale-105">
  Smooth all
</div>

// Opacity
<div className={cn(
  "transition-opacity duration-200",
  isVisible ? "opacity-100" : "opacity-0"
)}>
  Fade
</div>
```

---

## Radix UI Wrapper Patterns

Radix components are headless. You must wrap them with existing tokens.

### Dialog Wrapper

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@libs/utils/react';

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <AnimatePresence>
      {open && (
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-primary-900/50 dark:bg-primary-950/80"
            />
          </Dialog.Overlay>
          
          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "bg-gray-light-50 dark:bg-gray-dark-950",
                "rounded-xl shadow-xl",
                "border border-gray-light-300 dark:border-gray-dark-700",
                "p-6 w-full max-w-md",
                "focus:outline-none",
                className
              )}
            >
              {title && (
                <Dialog.Title className="text-xl font-semibold text-primary-900 dark:text-gray-dark-50 mb-2">
                  {title}
                </Dialog.Title>
              )}
              
              {description && (
                <Dialog.Description className="text-sm text-gray-light-600 dark:text-gray-dark-400 mb-4">
                  {description}
                </Dialog.Description>
              )}
              
              {children}
              
              <Dialog.Close asChild>
                <button
                  className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-light-100 dark:hover:bg-gray-dark-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-light-600 dark:text-gray-dark-400" />
                </button>
              </Dialog.Close>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </AnimatePresence>
  </Dialog.Root>
);
```

### Popover Wrapper

```typescript
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@libs/utils/react';

interface CustomPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const CustomPopover: React.FC<CustomPopoverProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'center',
  className
}) => (
  <Popover.Root open={open} onOpenChange={onOpenChange}>
    <Popover.Trigger asChild>
      {trigger}
    </Popover.Trigger>
    
    <AnimatePresence>
      {open && (
        <Popover.Portal forceMount>
          <Popover.Content
            side={side}
            align={align}
            sideOffset={8}
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "bg-gray-light-50 dark:bg-gray-dark-950",
                "rounded-lg shadow-lg",
                "border border-gray-light-300 dark:border-gray-dark-700",
                "p-4 min-w-[200px]",
                "focus:outline-none",
                className
              )}
            >
              {children}
              <Popover.Arrow className="fill-gray-light-300 dark:fill-gray-dark-700" />
            </motion.div>
          </Popover.Content>
        </Popover.Portal>
      )}
    </AnimatePresence>
  </Popover.Root>
);
```

### Select Wrapper

```typescript
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@libs/utils/react';

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  className
}) => (
  <Select.Root value={value} onValueChange={onValueChange}>
    <Select.Trigger
      className={cn(
        "flex items-center justify-between",
        "bg-gray-light-50 dark:bg-gray-dark-950",
        "border border-gray-light-300 dark:border-gray-dark-700",
        "rounded-lg px-4 py-2 min-w-[200px]",
        "text-sm text-primary-900 dark:text-gray-dark-50",
        "hover:bg-gray-light-100 dark:hover:bg-gray-dark-900",
        "focus:outline-none focus:ring-2 focus:ring-purple-500",
        "transition-colors",
        className
      )}
    >
      <Select.Value placeholder={placeholder} />
      <Select.Icon>
        <ChevronDown className="h-4 w-4 text-gray-light-600 dark:text-gray-dark-400" />
      </Select.Icon>
    </Select.Trigger>
    
    <Select.Portal>
      <Select.Content
        className={cn(
          "bg-gray-light-50 dark:bg-gray-dark-950",
          "rounded-lg shadow-lg",
          "border border-gray-light-300 dark:border-gray-dark-700",
          "overflow-hidden"
        )}
      >
        <Select.Viewport className="p-1">
          {options.map((option) => (
            <Select.Item
              key={option.value}
              value={option.value}
              className={cn(
                "flex items-center justify-between",
                "px-3 py-2 rounded-md",
                "text-sm text-primary-900 dark:text-gray-dark-50",
                "hover:bg-gray-light-100 dark:hover:bg-gray-dark-900",
                "focus:outline-none focus:bg-gray-light-100 dark:focus:bg-gray-dark-900",
                "cursor-pointer transition-colors"
              )}
            >
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator>
                <Check className="h-4 w-4 text-purple-600" />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
```

---

## Common Patterns

### Card

```tsx
<div className="bg-gray-light-50 dark:bg-gray-dark-950 rounded-lg border border-gray-light-300 dark:border-gray-dark-700 p-6">
  <h3 className="text-lg font-semibold text-primary-900 dark:text-gray-dark-50 mb-2">
    Card Title
  </h3>
  <p className="text-sm text-gray-light-600 dark:text-gray-dark-400">
    Card description text
  </p>
</div>
```

### Button Variants

```tsx
// Primary
<button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
  Primary
</button>

// Secondary
<button className="bg-gray-light-200 dark:bg-gray-dark-800 hover:bg-gray-light-300 dark:hover:bg-gray-dark-700 text-primary-900 dark:text-gray-dark-50 px-4 py-2 rounded-lg transition-colors">
  Secondary
</button>

// Outline
<button className="border border-gray-light-300 dark:border-gray-dark-700 hover:bg-gray-light-100 dark:hover:bg-gray-dark-900 text-primary-900 dark:text-gray-dark-50 px-4 py-2 rounded-lg transition-colors">
  Outline
</button>

// Ghost
<button className="hover:bg-gray-light-100 dark:hover:bg-gray-dark-900 text-primary-900 dark:text-gray-dark-50 px-4 py-2 rounded-lg transition-colors">
  Ghost
</button>

// Danger
<button className="bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg transition-colors">
  Delete
</button>
```

### List with Hover States

```tsx
<div className="space-y-2">
  {items.map((item) => (
    <motion.div
      key={item.id}
      whileHover={{ x: 4 }}
      className="bg-gray-light-50 dark:bg-gray-dark-950 border border-gray-light-300 dark:border-gray-dark-700 rounded-lg p-4 cursor-pointer hover:border-purple-500 transition-colors"
    >
      <h4 className="font-medium text-primary-900 dark:text-gray-dark-50">{item.title}</h4>
      <p className="text-sm text-gray-light-600 dark:text-gray-dark-400">{item.description}</p>
    </motion.div>
  ))}
</div>
```

### Loading State

```tsx
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 text-purple-600 animate-spin-slow" />
  </div>
) : (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {content}
  </motion.div>
)}
```

### Error State

```tsx
<div className="bg-error-50 dark:bg-error-900/20 border border-error-300 dark:border-error-700 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-medium text-error-900 dark:text-error-200">Error occurred</h4>
      <p className="text-sm text-error-700 dark:text-error-300 mt-1">
        {errorMessage}
      </p>
    </div>
  </div>
</div>
```

---

## Accessibility

### Semantic HTML

```tsx
<main>
  <header>
    <h1>Page Title</h1>
  </header>
  
  <section>
    <h2>Section Title</h2>
    {/* content */}
  </section>
  
  <footer>
    {/* footer content */}
  </footer>
</main>
```

### ARIA Attributes

```tsx
// Icon-only button
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Expandable section
<button
  aria-expanded={isExpanded}
  aria-controls="content-id"
  onClick={() => setIsExpanded(!isExpanded)}
>
  Toggle
</button>
<div id="content-id" hidden={!isExpanded}>
  Content
</div>

// Loading state
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>
```

### Focus Management

```tsx
// Visible focus ring
<button className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg">
  Focusable
</button>

// Focus-visible (only on keyboard focus)
<button className="focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg">
  Keyboard Focus
</button>
```

### Keyboard Navigation

```tsx
// Handle keyboard events
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Interactive element
</div>
```

---

## Critical Rules

### ❌ Forbidden

- **No new design tokens**: Only use colors, spacing, shadows from `tailwind.config.js`
- **No hard-coded colors**: Never use `text-[#abc123]` or `bg-[#def456]`
- **No arbitrary values**: Never use `w-[347px]` or `p-[23px]`
- **No old Icon component**: Use `lucide-react` instead
- **No new animations**: Only use existing Tailwind animations or `framer-motion`
- **No unstyled Radix**: Always wrap Radix components with existing tokens

### ✅ Required

- Use existing color tokens from `tailwind.config.js`
- Use `lucide-react` for all icons
- Use `framer-motion` for complex animations, Tailwind for simple
- Wrap all Radix components with existing tokens
- Support both light and dark modes with `dark:` prefix
- Include proper TypeScript types
- Add JSDoc comments for complex logic
- Export with `React.memo` for performance
- Handle loading, empty, and error states
- Ensure keyboard accessibility

---

## Validation Checklist

Before submitting, verify:

- [ ] No new design tokens introduced
- [ ] All colors use existing tokens from `tailwind.config.js`
- [ ] No hard-coded colors or arbitrary values
- [ ] All icons are from `lucide-react` (no old Icon component)
- [ ] Animations use `framer-motion` or existing Tailwind classes
- [ ] Radix components are properly wrapped and styled
- [ ] Both light and dark modes supported
- [ ] TypeScript types are correct
- [ ] Accessibility attributes present
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] Component is memoized with `React.memo`
- [ ] Loading/error/empty states handled

---

## Quick Reference

| Need | Solution |
|------|----------|
| Icons | `import { Check } from 'lucide-react'` → `<Check className="h-5 w-5 text-success-600" />` |
| Entrance animation | `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>` |
| Exit animation | Wrap with `<AnimatePresence>` and add `exit` prop |
| Hover effect | `whileHover={{ scale: 1.05 }}` or `hover:bg-gray-light-100 transition-colors` |
| Dialog | Wrap `@radix-ui/react-dialog` with existing tokens |
| Colors | Use `bg-gray-light-50`, `text-primary-900`, `border-gray-light-300` |
| Dark mode | Add `dark:` prefix: `dark:bg-gray-dark-950` |
| Spacing | Use `p-4`, `gap-6`, `space-y-4` |
| Loading | `<Loader2 className="animate-spin-slow" />` |

---

**Remember**: This guide provides the vocabulary. You write the story. Be creative while staying within existing design tokens.

