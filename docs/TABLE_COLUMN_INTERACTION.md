# Table Column Interaction Guide

## Overview

The concept bank table supports rich column interactions including **reordering** and **resizing** for property columns, providing a Notion-like experience.

## Column Structure

### Static Columns

The concept bank table includes the following static columns:

1. **Title** - Concept title with navigation and unseen changes indicator (blue dot prefix when concept has been modified but not viewed)
2. **Created By** - User who created the concept (with avatar)
3. **Created Date** - Timestamp when concept was created
4. **Last Modified By** - User who last modified the concept (with avatar)
5. **Last Modified Date** - Timestamp when concept was last modified
6. **Status** - Current concept status (editable via dropdown)

**Note:** The Created By and Last Modified columns are split into separate user and date columns for better filtering and sorting capabilities. Each column has its own independent sort field:
- **Created By** sorts by `created_by__first_name`
- **Created Date** sorts by `created_at`
- **Last Modified By** sorts by `updated_by__first_name`
- **Last Modified Date** sorts by `updated_at`

**Unseen Changes Indicator:** A small blue dot appears as a prefix to the concept title when the concept has been modified but the user hasn't viewed those changes yet. Hovering over the dot shows when the concept was last updated.

### Editable Columns

The following static columns support inline editing:

- **Status** - Click to open a dropdown menu with all available concept statuses. Selection immediately updates the concept status via API call with optimistic UI updates.

## Column Resizing

### How It Works

All columns with `enableResizing: true` can be resized by dragging the resize handle on the right edge of the column header.

### Visual Feedback

**Resize Handle:**
- Appears as a subtle 1px line on the right edge of each resizable column
- Hover: Changes to brand primary color
- Active (dragging): Scales to 2px width and shows brand primary color
- Smooth transitions for visual feedback

**Implementation:**
```typescript
{header.column.getCanResize() && (
  <div
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    className={cn(
      'absolute right-0 top-0 h-full w-1 cursor-col-resize',
      'hover:aucctus-bg-brand-primary transition-colors',
      { 'aucctus-bg-brand-primary': header.column.getIsResizing() }
    )}
    style={{
      transform: header.column.getIsResizing() ? 'scaleX(2)' : undefined,
    }}
  />
)}
```

### User Experience

1. **Hover State:** Resize handle becomes visible and changes color
2. **Click and Drag:** Column width adjusts in real-time
3. **Min/Max Constraints:** Respects `minSize` and `maxSize` from column definition
4. **Touch Support:** Works on touch devices via `onTouchStart`

### Column Size Configuration

```typescript
// Property columns
columnHelper.accessor((row) => row.customProperties?.[propDef.key], {
  size: 150,        // Default width
  minSize: 100,     // Minimum width
  maxSize: 300,     // Maximum width
  enableResizing: true,
});

// Static columns (example)
columnHelper.accessor('title', {
  size: 500,
  minSize: 500,
  maxSize: 500,
  enableResizing: true,
});
```

## Column Reordering (Property Columns Only)

### How It Works

Property columns can be reordered via drag-and-drop. The order is persisted to the backend.

### Visual Feedback

**Drag States:**

1. **Dragging Column:**
   - Opacity: 50%
   - Shows the column is being moved

2. **Drop Target:**
   - Background: Brand secondary color
   - Shows which column will be affected

3. **Drop Indicator Line:**
   - Position: Left or right edge of drop target
   - Color: Brand primary with glow effect
   - Width: 4px (2px scaled to 2x)
   - Shows exactly where the column will be inserted

**Implementation:**
```typescript
const [dropPosition, setDropPosition] = React.useState<'left' | 'right' | null>(null);

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(true);
  
  // Determine drop position based on mouse position
  const rect = e.currentTarget.getBoundingClientRect();
  const midPoint = rect.left + rect.width / 2;
  setDropPosition(e.clientX < midPoint ? 'left' : 'right');
};

// Drop indicator line
{isDragOver && dropPosition && (
  <div
    className={`absolute top-0 bottom-0 w-1 aucctus-bg-brand-primary z-50 ${
      dropPosition === 'left' ? 'left-0' : 'right-0'
    }`}
    style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}
  />
)}
```

### User Experience

1. **Grab Column:** Click and hold on any property column header
2. **Drag:** Column becomes semi-transparent (50% opacity)
3. **Hover Over Target:** 
   - Target column highlights with brand secondary background
   - Drop indicator line appears on left or right edge
   - Line position updates based on mouse position relative to column center
4. **Drop:** Column reorders and new order is saved to backend

### Drop Position Logic

```typescript
// If mouse is left of column center → insert before (left line)
// If mouse is right of column center → insert after (right line)
const midPoint = rect.left + rect.width / 2;
setDropPosition(e.clientX < midPoint ? 'left' : 'right');
```

### Backend Persistence

When a column is reordered:

```typescript
const handleColumnReorder = (draggedKey: string, targetKey: string) => {
  reorderColumns({
    accountUuid,
    draggedKey,
    targetKey,
  });
};
```

The backend updates the `display_order` field for all affected property definitions.

## Styling Details

### Resize Handle

```scss
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 4px; // 1px base, scales to 2px when active
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  
  &:hover {
    background: var(--brand-primary);
  }
  
  &.resizing {
    background: var(--brand-primary);
    transform: scaleX(2);
  }
}
```

### Drop Indicator

```scss
.drop-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px; // 1px base, scales to 2x
  background: var(--brand-primary);
  z-index: 50;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  
  &.left {
    left: 0;
  }
  
  &.right {
    right: 0;
  }
}
```

## Accessibility

### Resize Handle
- **Cursor:** `col-resize` indicates resizable column
- **Touch Support:** Works on touch devices
- **Visual Feedback:** Clear hover and active states

### Drag and Drop
- **Cursor:** Changes to indicate drag state
- **Visual Feedback:** Multiple indicators (opacity, background, line)
- **Clear Target:** Drop indicator shows exact insertion point

## Performance Considerations

### Resize Performance
- Real-time width updates during drag
- TanStack Table handles re-rendering efficiently
- No backend calls during resize (only visual update)

### Reorder Performance
- Optimistic UI update (immediate visual feedback)
- Background API call to persist order
- Loading overlay shown during backend update
- Query invalidation refreshes table data

## Related Files

- **Table Header:** `src/app/components/Tables/Header.tsx`
- **Property Column Header:** `src/app/components/Tables/PropertyColumns/PropertyColumnHeader.tsx`
- **Table Hook:** `src/app/hooks/tables/concept-bank.hook.tsx`
- **Reorder Mutation:** `src/app/hooks/query/properties-mutations.hook.ts`

## Editable Status Cell

### Overview

The Status column supports inline editing similar to dynamic property columns. Users can click on any status badge to open a dropdown menu and change the concept's status.

### Implementation

**Component:** `src/app/components/Tables/ConceptBank/EditableStatusCell.tsx`

The component follows the same pattern as `EditablePropertyCell`:
- Portal-based dropdown rendering (avoids z-index issues)
- Smooth animations with `react-spring`
- Optimistic UI updates
- Error handling with rollback
- Loading states during API calls

### Available Statuses

The dropdown includes all concept statuses:
1. **New** - Initial concept state
2. **Ideating** - Early exploration phase
3. **In Review** - Under evaluation
4. **Prototyping** - Building prototype
5. **POC** - Proof of concept stage
6. **MVP** - Minimum viable product
7. **Commercialized** - Launched to market
8. **Archived** - No longer active

### User Experience

1. **Display Mode:**
   - Status badge shows current status with color coding
   - Hover effect indicates editability
   - Click to open dropdown

2. **Edit Mode:**
   - Dropdown appears below the cell
   - Current status shown at reduced opacity
   - All statuses displayed with their color schemes
   - Click any status to update

3. **Update Flow:**
   - Immediate visual feedback (optimistic update)
   - API call to `api.concept.updateConceptStatus()`
   - Success toast notification
   - Query invalidation refreshes table
   - Error handling reverts to previous value

### API Integration

```typescript
// Update concept status
await api.concept.updateConceptStatus(conceptIdentifier, newStatus);

// Invalidate queries to refresh table
queryClient.invalidateQueries([AucctusQueryKeys.concepts]);
```

### Styling

Status badges maintain their color schemes from `getConceptStatusStyles()`:
- Each status has unique background and text colors
- Border color matches the status color scheme
- Consistent styling between display and dropdown

### Accessibility

- **Keyboard Support:** Arrow keys and Enter/Space for selection
- **Visual Feedback:** Clear hover and selected states
- **Loading States:** Spinner overlay during updates
- **Error Recovery:** Toast notifications and automatic rollback

## Future Enhancements

- [ ] Persist column widths to user preferences
- [ ] Double-click resize handle to auto-fit content
- [ ] Keyboard shortcuts for column operations
- [ ] Undo/redo for column reordering
- [ ] Column width presets (narrow, medium, wide)
- [ ] Bulk status updates for multiple concepts
- [ ] Status change history/audit log

