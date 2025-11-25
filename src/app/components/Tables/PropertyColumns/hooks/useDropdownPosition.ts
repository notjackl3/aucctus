import { useState, useEffect, RefObject } from 'react';

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

/**
 * Custom hook to manage dropdown positioning
 * Calculates position below the cell with proper alignment
 */
export const useDropdownPosition = (
  isOpen: boolean,
  selectRef: RefObject<HTMLDivElement>,
  cellRef: RefObject<HTMLButtonElement>,
) => {
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    if (isOpen) {
      // Use selectRef (edit mode container) if available, otherwise cellRef (display button)
      const refToUse = selectRef.current || cellRef.current;
      if (refToUse) {
        const rect = refToUse.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4, // Position below the cell with 4px gap
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [isOpen, selectRef, cellRef]);

  return dropdownPosition;
};
