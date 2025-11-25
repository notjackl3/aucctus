# Table Filters Architecture

## Overview
The concept bank table features Notion-style filter menus integrated directly into column headers. Filters support multi-select (OR logic) and use local state buffering to prevent re-renders while selecting options.

## Key Components

### 1. StatusFilterMenu
**Location:** `src/app/components/Tables/ConceptBank/StatusFilterMenu.tsx`

Multi-select filter for concept status (active, draft, archived, etc.).

**Features:**
- Multi-select checkboxes (OR logic)
- Count badge showing active selections
- Stays open until click-away or Escape
- Buffered updates (only applies on close)

### 2. CreatedByFilterMenu
**Location:** `src/app/components/Tables/ConceptBank/CreatedByFilterMenu.tsx`

Multi-select filter for concept creators with searchable user list.

**Features:**
- Multi-select checkboxes (OR logic)
- Searchable user list with avatars
- Count badge showing active selections
- Stays open until click-away or Escape
- Buffered updates (only applies on close)

### 3. LastModifiedByFilterMenu
**Location:** `src/app/components/Tables/ConceptBank/LastModifiedByFilterMenu.tsx`

Multi-select filter for users who last modified concepts with searchable user list.

**Features:**
- Multi-select checkboxes (OR logic)
- Searchable user list with avatars
- Count badge showing active selections
- Stays open until click-away or Escape
- Buffered updates (only applies on close)

### 4. NotionStyleColumnMenu
**Location:** `src/app/components/Tables/PropertyColumns/NotionStyleColumnMenu.tsx`

Filter/sort menu for dynamic property columns.

**Features:**
- Filter by property value (with type-specific operators)
- Sort ascending/descending
- Edit/delete property
- Animated mount/unmount

**Filter Operators by Property Type:**
- **Text**: `exact`, `contains` (default), `has`, `is_null` - supports multiple text search strategies
- **Number**: `exact`, `gt`, `gte`, `lt`, `lte` - supports comparison operators
- **Select**: `exact` - matches exact option value
- **Multi-Select**: `in` - checks if array contains the value
- **Checkbox**: `exact` - matches true/false value

## Architecture Patterns

### Local State Buffering
**Problem:** Updating filters immediately causes table re-renders, which closes the popover.

**Solution:** Buffer changes in local state, apply on menu close.

```typescript
// Local state for buffering
const [localSelection, setLocalSelection] = useState<Set<IUser>>(filterOptions.createdBy);

// Sync when menu opens
useEffect(() => {
  if (isOpen) {
    setLocalSelection(filterOptions.createdBy);
  }
}, [isOpen, filterOptions.createdBy]);

// Apply changes when closing
const handleClose = () => {
  setIsOpen(false);
  if (localSelection !== filterOptions.createdBy) {
    updateFilterOptions({ createdBy: localSelection });
  }
};
```

### Preventing Auto-Close
**Problem:** Radix Popover auto-closes on internal interactions.

**Solution:** Use `modal={false}` and control `onOpenChange`.

```typescript
<Popover.Root 
  open={isOpen} 
  onOpenChange={(open) => {
    // Only allow closing via explicit user action
    if (!open) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }} 
  modal={false}
>
```

### Immediate Checkbox Updates
**Problem:** React doesn't detect Set mutations, causing lag in checkbox state.

**Solution:** Use functional setState and force re-render with dynamic keys.

```typescript
// Functional setState ensures fresh state reference
setLocalSelection((prev) => {
  const newSet = new Set(prev);
  if (newSet.has(value)) {
    newSet.delete(value);
  } else {
    newSet.add(value);
  }
  return newSet;
});

// Dynamic key forces re-mount on state change
<Input.CheckBox
  key={`checkbox-${value}-${isSelected}`}
  checked={isSelected}
  onChange={handleToggle}
/>
```

### Clickable Rows
Entire row is clickable for better UX:

```typescript
<div
  className='flex cursor-pointer items-center gap-2 px-3 py-2'
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggle();
  }}
>
  <Input.CheckBox checked={isSelected} onChange={() => {}} />
  <span>Label</span>
</div>
```

## Data Flow

### Filter State Structure
```typescript
interface IConceptFilterOptions {
  status: Set<ConceptStatus>;      // Multi-select status filter
  createdBy?: Set<IUser>;          // Multi-select user filter (concept creators)
  lastModifiedBy?: Set<IUser>;     // Multi-select user filter (last modifiers)
  search?: string;                 // Text search
  sort?: ConceptSort;              // Sort configuration
  propertyFilters?: IPropertyFilter[]; // Dynamic property filters
}
```

### API Query Transformation
```typescript
// Convert Sets to comma-separated strings for API
const queryOptions = {
  status: Array.from(filterOptions.status).join(','),
  createdBy: filterOptions.createdBy
    ? Array.from(filterOptions.createdBy)
        .map(user => `${user.firstName} ${user.lastName}`)
        .join(',')
    : undefined,
  lastModifiedBy: filterOptions.lastModifiedBy
    ? Array.from(filterOptions.lastModifiedBy)
        .map(user => `${user.firstName} ${user.lastName}`)
        .join(',')
    : undefined,
  // Property filters as JSON array with AND logic
  // IMPORTANT: Boolean values must be stringified before sending to API
  properties: filterOptions.propertyFilters?.length > 0
    ? JSON.stringify(
        filterOptions.propertyFilters.map(filter => ({
          ...filter,
          value: typeof filter.value === 'boolean' 
            ? String(filter.value) 
            : filter.value,
        }))
      )
    : undefined,
};

// Example result:
// ?status=active,draft&properties=[{"key":"priority","value":"High"},{"key":"team_size","value":"10","operator":"gte"}]
// Boolean example:
// ?properties=[{"key":"is_active","value":"true","operator":"exact"}]
```

### Filter Application Flow
1. User opens filter menu → Local state syncs with global filters
2. User selects/deselects items → Updates local state only
3. Badge count updates immediately → Reads from local state
4. User clicks outside or presses Escape → `handleClose()` applies filters
5. Global filter state updates → Table re-renders with new data
6. Filter chips appear in header → Shows active filters

## Integration Points

### Table Hook
**Location:** `src/app/hooks/tables/concept-bank.hook.tsx`

Manages filter state and builds table columns.

```typescript
// Filter state management
const [filterOptions, setFilterOptions] = useState<IConceptFilterOptions>(INITIAL_FILTER);

// Update function passed to filter menus
const updateTableFiltering = (value: Partial<IConceptFilterOptions>) => {
  setFilterOptions({ ...filterOptions, ...value });
  setPage(1); // Reset pagination
};
```

### Column Headers
Filter menus are rendered in column headers:

```typescript
columnHelper.accessor('status', {
  header: () => (
    <Table.ConceptBank.StatusFilterMenu
      filterOptions={filterOptions}
      updateFilterOptions={updateTableFiltering}
    />
  ),
  // ...
});
```

### Filter Chips
**Location:** `src/app/pages/Concept/Bank.tsx`

Active filters display as removable chips in the page header.

```typescript
// Property filters display with formatted values
if (key === 'propertyFilters' && Array.isArray(value) && value.length > 0) {
  value.forEach((filter) => {
    const propDef = propertyDefinitions?.find((def) => def.key === filter.key);
    
    // Format boolean values
    let formattedValue = filter.value;
    if (typeof filter.value === 'boolean') {
      formattedValue = filter.value ? 'Checked' : 'Unchecked';
    }
    
    // Add operator prefix for numeric comparisons
    let operatorPrefix = '';
    if (filter.operator && !['exact', 'contains', 'in'].includes(filter.operator)) {
      const operatorMap = { 'gt': '>', 'gte': '≥', 'lt': '<', 'lte': '≤' };
      operatorPrefix = operatorMap[filter.operator] ? `${operatorMap[filter.operator]} ` : '';
    }
    
    const displayValue = `${propDef?.name || filter.key}: ${operatorPrefix}${formattedValue}`;
  });
}

// Convert Set<IUser> to display string
if (key === 'createdBy' || key === 'lastModifiedBy') {
  itemValue = Array.from(value)
    .map((user) => utils.account.getUsersFullName(user))
    .join(', ');
}

// Check if any filters are active (including property filters)
const areFilterOptionsSet = (filterOptions) => {
  const { status, createdBy, search, sort } = filterOptions;
  const lastModifiedBy = 'lastModifiedBy' in filterOptions ? filterOptions.lastModifiedBy : undefined;
  const propertyFilters = 'propertyFilters' in filterOptions ? filterOptions.propertyFilters : undefined;
  
  return (
    (status && status.size > 0) || 
    !!createdBy || 
    !!lastModifiedBy ||
    !!search || 
    !!sort ||
    (propertyFilters && propertyFilters.length > 0) // ← Must include this!
  );
};
```

## Animation System

All filter menus use `react-spring` for smooth mount/unmount animations:

```typescript
const menuTransition = useTransition(isOpen, {
  from: { opacity: 0, transform: 'scale(0.95) translateY(-8px)' },
  enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
  leave: { opacity: 0, transform: 'scale(0.95) translateY(-8px)' },
  config: { tension: 300, friction: 25 },
});
```

## Filter Operator Handling

### Type-Specific Operators

The system properly handles different filter operators based on property type:

```typescript
// Text properties support multiple operators
case 'text':
  operator: 'exact' | 'contains' | 'is_null' | 'not_blank'
  // User can select operator from dropdown:
  // - Equals (exact match) - Find concepts where text equals exactly
  // - Contains (substring search, default) - Search for text containing a term
  // - Is empty - Find concepts missing this property or with null value
  // - Is not blank - Find concepts with non-empty values (excludes null, missing, and empty strings)

// Number properties support comparison operators
case 'number':
  operator: 'exact' | 'gt' | 'gte' | 'lt' | 'lte' | 'is_null' | 'not_blank'
  // User can select operator from dropdown:
  // - Equals (=)
  // - Greater than (>)
  // - Greater than or equal (≥)
  // - Less than (<)
  // - Less than or equal (≤)
  // - Is empty - Find concepts missing this property or with null value
  // - Is not blank - Find concepts with non-null values (excludes null and missing)

// Select properties use exact matching
case 'select':
  operator: 'exact'

// Multi-Select properties use 'in' operator
case 'multi_select':
  operator: 'in'
  // Checks if the array contains the selected value

// Checkbox properties use exact matching
case 'checkbox':
  operator: 'exact'
```

### Text Property Filtering in Detail

Text properties offer the most flexible filtering options to handle various search scenarios:

**Available Operators:**

1. **Equals (`exact`)** - Exact string match
   - Use case: Find concepts with a specific exact value
   - Example: Filter "Status" column for exactly "In Progress"
   - Case-sensitive matching
   - UI: Text input field

2. **Contains (`contains`)** - Substring search (default)
   - Use case: Search for text containing a term
   - Example: Filter "Description" containing "API"
   - Case-insensitive matching
   - Most commonly used for general text search
   - UI: Text input field

3. **Is empty (`is_null`)** - Property absence check
   - Use case: Find concepts missing this property or with null value
   - Example: Show all concepts without a "Description"
   - No value input required
   - UI: No input field shown (operator selection only)

4. **Is not blank (`not_blank`)** - Property has non-empty value
   - Use case: Find concepts with actual content (excludes null, missing, and empty strings)
   - Example: Show all concepts that have a non-empty "Description"
   - No value input required
   - UI: No input field shown (operator selection only)

**Implementation Notes:**
- Default operator is `contains` for intuitive text search
- `is_null` and `not_blank` operators don't require a filter value
- Filter chips display operator-specific labels:
  - `is_null` → "Is empty"
  - `not_blank` → "Is not blank"
  - Other operators show the actual filter value

### All Supported Operators

The backend supports the following operators (defined in `IPropertyFilter`):

| Operator | Description | Use Case |
|----------|-------------|----------|
| `exact` | Exact match | Default for select, checkbox, and number equality |
| `contains` | Case-insensitive substring search | Text fields |
| `gt` | Greater than | Numeric comparisons |
| `gte` | Greater than or equal | Numeric comparisons |
| `lt` | Less than | Numeric comparisons |
| `lte` | Less than or equal | Numeric comparisons |
| `in` | Array contains value | Multi-select fields |
| `is_null` | Property is null or missing | Property absence checks |
| `not_blank` | Property exists, not null, and not empty | Find non-empty text/number values |

### Implementation Details

1. **State Management**: The `NotionStyleColumnMenu` maintains both `filterValue` and `filterOperator` in local state
2. **Operator Persistence**: The selected operator is preserved when editing an existing filter
3. **Default Operators**: Each property type has a sensible default operator
4. **UI Rendering**: 
   - **Text fields**: Show operator dropdown (`exact`, `contains`, `is_null`, `not_blank`) above text input
     - For `is_null` and `not_blank` operators, text input is hidden (no value needed)
   - **Number fields**: Show operator dropdown (`exact`, `gt`, `gte`, `lt`, `lte`, `is_null`, `not_blank`) above value input
     - For `is_null` and `not_blank` operators, value input is hidden (no value needed)
   - **Select/Multi-Select/Checkbox**: Show dropdown with instant filter application
5. **Filter Application**:
   - **Text/Number**: Apply on "Apply" button click or Enter key
     - Exception: `is_null` and `not_blank` operators apply immediately (no value needed)
   - **Select/Multi-Select/Checkbox**: Apply immediately on selection change
6. **Current Filter Display**: Active filters show in column header with visual indicator
7. **Filter State Flow**: `buildPropertyColumns` receives `currentFilters` array and passes relevant filter to each column header

## Property Filter Implementation

### Multiple Concurrent Filters with AND Logic

The system supports **multiple property filters active simultaneously** using **AND logic** - all conditions must be met for a concept to appear in results.

```typescript
// Example: Filter by Priority=High AND Team Size > 10 AND Is Active=Checked
filterOptions.propertyFilters = [
  { key: 'priority', value: 'High', operator: 'exact' },
  { key: 'team_size', value: 10, operator: 'gt' },
  { key: 'is_active', value: true, operator: 'exact' }
];

// This will return concepts where:
// - priority equals "High" AND
// - team_size is greater than 10 AND
// - is_active equals true
```

**Filter Logic:**
- **AND Logic**: All filter conditions must be met (intersection)
- **Per-Property Limit**: Each property can have one active filter
- **Multi-Property Support**: Multiple different properties can be filtered simultaneously

**Filter Management:**
- Applying a new filter to an already-filtered property **updates** that filter
- Clearing a filter (empty value) **removes** only that property's filter
- Each filter chip has its own remove button
- Removing one filter preserves all other active filters

**Backend Communication:**
```http
GET /api/concepts/v1/?properties=[{"key":"priority","value":"High"},{"key":"team_size","value":"10","operator":"gt"}]
```

- Parameter name: `properties` (JSON-encoded array)
- Uses **AND logic** - all filter conditions must be met
- Backend parses JSON array and applies all filters simultaneously
- Each filter object: `{ key: string, value: any, operator?: string }`
- Operator defaults to `"exact"` if not specified

**Example Queries:**

```javascript
// Single filter
?properties=[{"key":"priority","value":"High"}]

// Multiple filters with AND logic
?properties=[{"key":"priority","value":"High"},{"key":"team_size","value":"10","operator":"gte"}]

// Complex multi-filter with boolean (note: boolean is stringified)
?properties=[{"key":"priority","value":"High"},{"key":"tech_stack","value":"Backend","operator":"in"},{"key":"is_active","value":"true"}]

// Boolean filter example (true/false converted to "true"/"false" strings)
?properties=[{"key":"launchable","value":"true","operator":"exact"}]
```

### Complete Filter Flow

```typescript
// 1. User clicks filter in NotionStyleColumnMenu
// 2. Filter is applied via onFilterChange callback
onFilterChange({
  key: 'priority',
  value: 'High',
  operator: 'exact'
});

// 3. handlePropertyFilterChange in concept-bank hook updates state
const handlePropertyFilterChange = (filter: IPropertyFilter) => {
  // IMPORTANT: false is a valid boolean value, so check explicitly for null/undefined/empty
  const shouldClearFilter = 
    filter.value === null || 
    filter.value === undefined || 
    filter.value === '';
    
  if (shouldClearFilter) {
    // Clear this specific filter by key
    const updatedFilters = (filterOptions.propertyFilters || []).filter(
      (f) => f.key !== filter.key
    );
    updateTableFiltering({ propertyFilters: updatedFilters });
  } else {
    // Add or update filter for this property (supports multiple concurrent filters)
    const existingFilters = filterOptions.propertyFilters || [];
    const existingIndex = existingFilters.findIndex((f) => f.key === filter.key);
    
    let updatedFilters: IPropertyFilter[];
    if (existingIndex >= 0) {
      // Update existing filter
      updatedFilters = [...existingFilters];
      updatedFilters[existingIndex] = filter;
    } else {
      // Add new filter
      updatedFilters = [...existingFilters, filter];
    }
    
    updateTableFiltering({ propertyFilters: updatedFilters });
  }
};

// 4. filterOptions.propertyFilters is passed to buildPropertyColumns
const propertyColumns = buildPropertyColumns(
  propertyDefinitions,
  visiblePropertyColumns,
  columnHelper,
  handlePropertyFilterChange,
  handlePropertySort,
  filterOptions.sort,
  filterOptions.propertyFilters, // ← Current filters
  handleColumnReorder,
);

// 5. buildPropertyColumns finds matching filter for each column
const getCurrentFilter = () => {
  return currentFilters?.find((filter) => filter.key === propDef.key);
};

// 6. PropertyColumnHeader receives currentFilter prop
<PropertyColumnHeader
  definition={propDef}
  onFilterChange={onFilterChange}
  currentFilter={getCurrentFilter()}
  // ...
/>

// 7. NotionStyleColumnMenu syncs local state with currentFilter
useEffect(() => {
  setFilterValue(currentFilter?.value || '');
  setFilterOperator(currentFilter?.operator || getDefaultOperator());
}, [currentFilter, getDefaultOperator]);

// 8. API query includes filter params (supports multiple concurrent filters with AND logic)
const queryOptions = {
  // Send all filters as JSON-encoded array using 'properties' parameter
  properties: filterOptions.propertyFilters && filterOptions.propertyFilters.length > 0
    ? JSON.stringify(filterOptions.propertyFilters)
    : undefined,
};

// Example query string:
// ?properties=[{"key":"priority","value":"High"},{"key":"team_size","value":"10","operator":"gte"}]

// 9. React Query key includes JSON-encoded filters for cache invalidation
queryKey: [
  AucctusQueryKeys.concepts,
  // ... other params
  queryOptions.properties, // JSON string includes all filters
]
```

### Filter Behavior by Type

| Type | UI Component | Apply Timing | Clear Behavior |
|------|-------------|--------------|----------------|
| **Text** | Operator dropdown + text input | On "Apply" or Enter | Clear button |
| **Number** | Operator dropdown + number input | On "Apply" or Enter | Clear button |
| **Select** | Dropdown | Immediate on change | Select "All values" |
| **Multi-Select** | Dropdown | Immediate on change | Select "All values" |
| **Checkbox** | Dropdown (Checked/Unchecked/All) | Immediate on change | Select "All" |

## Common Patterns

### Adding a New Filter Menu

1. **Create the component** following the pattern in `StatusFilterMenu.tsx`
2. **Use local state buffering** to prevent premature table re-renders
3. **Add to column definition** in the table hook
4. **Update filter interface** if adding new filter type
5. **Handle in filter chips** display logic

### Debugging Checklist

#### For Status/CreatedBy Filters (Multi-Select)
- ✅ Is `modal={false}` set on Popover.Root?
- ✅ Is `onOpenChange` controlled to prevent auto-close?
- ✅ Are checkboxes using functional setState?
- ✅ Do checkboxes have dynamic keys for re-mounting?
- ✅ Is local state syncing when menu opens?
- ✅ Are filters applied in `handleClose()`?
- ✅ Is the entire row clickable?

#### For Property Filters
- ✅ Is `currentFilters` being passed to `buildPropertyColumns`?
- ✅ Does `PropertyColumnHeader` receive `currentFilter` prop?
- ✅ Are property filter params in React Query `queryKey`?
- ✅ Is `IConceptQueryOptions` interface updated with property filter fields?
- ✅ For checkbox: Is string `'true'`/`'false'` converted to boolean?
- ✅ For checkbox: Does `handlePropertyFilterChange` treat `false` as a valid value (not falsy)?
- ✅ For checkbox: Are boolean values stringified before sending to API?
- ✅ For select/multi-select: Does empty selection clear the filter?
- ✅ Does the filter menu close after selection (for select/multi-select/checkbox)?

## Performance Considerations

### Query Staleness Settings

The concepts list query is configured for maximum freshness with active filtering and editing:

```typescript
staleTime: 0,                 // Always stale - always refetch on interaction
cacheTime: 1000 * 60 * 5,    // 5 minutes - keep in cache
keepPreviousData: true,       // Smooth transitions during refetch
refetchOnWindowFocus: true,   // Update when user returns to tab
refetchOnMount: true,         // Always refetch when component mounts
refetchOnReconnect: true,     // Refetch when reconnecting to network
```

**Why staleTime: 0?**
- Users actively edit property values inline
- Property changes should reflect immediately across all views
- Filter results must always show current data
- With query invalidation on edits, ensures consistency

**Cache Strategy:**
- Each unique filter combination gets its own cache entry
- Switching between filters is instant (from cache)
- Background refetch updates all entries (staleTime: 0)
- 5-minute cache retention for quick filter switching
- **Query invalidation on property edits** ensures data consistency

**Property Edit Invalidation:**

When a property value is edited in `EditablePropertyCell`, the concepts query is immediately invalidated:

```typescript
// After successful property update
await api.property.setConceptProperty(conceptIdentifier, definition.key, value);

// Invalidate all concepts queries to refresh table
queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
```

This ensures:
- ✅ Edited values appear immediately in the table
- ✅ Filter results update if the edit affects filtering
- ✅ Sort order updates if the edit affects sorting
- ✅ All cached filter combinations are refreshed
- ✅ Consistency across multiple table views

### Why Buffer Updates?
- **Without buffering:** Each checkbox click → filter update → table re-render → menu closes
- **With buffering:** Multiple selections → single filter update → one table re-render

### Why Functional setState?
- **Ensures correct state reference** when rapid clicks occur
- **Prevents race conditions** from async state updates
- **Guarantees fresh state** for each update

### Why Dynamic Keys?
- **Forces React to re-mount** checkbox components
- **Ensures `checked` prop is fresh** on every state change
- **Trade-off:** Slightly more expensive but guarantees correctness

## Related Files

- **Filter Components:** `src/app/components/Tables/ConceptBank/`
- **Property Filters:** `src/app/components/Tables/PropertyColumns/`
- **Table Hook:** `src/app/hooks/tables/concept-bank.hook.tsx`
- **Filter Display:** `src/app/pages/Concept/Bank.tsx`
- **Type Definitions:** `src/libs/api/types/`
- **Animation Guide:** `.cursor/rules/animation-rules.mdc`

## Future Enhancements

- [ ] Add "Select All" / "Clear All" buttons
- [ ] Persist filter state in URL query params
- [ ] Add filter presets/saved views
- [ ] Support AND logic in addition to OR
- [ ] Add date range filters
- [ ] Add numeric range filters
- [ ] Keyboard navigation within menus
- [ ] Respect `prefers-reduced-motion` for animations

