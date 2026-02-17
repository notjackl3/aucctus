import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@libs/utils/react';
import ConceptVersionsDropdown from './Dropdown/ConceptVersionsDropdown';
import { ClockArrowDown } from 'lucide-react';

interface ConceptVersionsButtonProps {
  conceptUuid?: string;
  conceptIdentifier?: string;
  className?: string;
}

const ConceptVersionsButton: React.FC<ConceptVersionsButtonProps> = ({
  conceptUuid,
  conceptIdentifier,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create portal container on mount
  useEffect(() => {
    const div = document.createElement('div');
    div.style.transition = 'all 0.2s ease-in-out';
    document.body.appendChild(div);
    setPortalContainer(div);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  // Extract positioning logic into a separate function
  const positionDropdown = useCallback(() => {
    if (isOpen && buttonRef.current && dropdownRef.current && portalContainer) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320;

      // Calculate left position to ensure dropdown stays within viewport
      let leftPosition = buttonRect.left + window.scrollX - 100;

      // Check if dropdown would extend beyond right edge of viewport
      if (leftPosition + dropdownWidth > window.innerWidth + 20) {
        // Adjust position to align with right edge of viewport
        leftPosition = Math.max(0, window.innerWidth - 20 - dropdownWidth);
      }

      // Position dropdown below the button
      portalContainer.style.position = 'absolute';
      portalContainer.style.top = `${buttonRect.bottom + window.scrollY}px`;
      portalContainer.style.left = `${leftPosition}px`;
      portalContainer.style.minWidth = `${dropdownWidth}px`;
      portalContainer.style.maxWidth = `${dropdownWidth}px`;
      portalContainer.style.zIndex = '50';
    }
  }, [isOpen, portalContainer]);

  // Position dropdown when it opens
  useEffect(() => {
    positionDropdown();
  }, [isOpen, portalContainer, positionDropdown]);

  // Reposition dropdown on window resize (debounced)
  useEffect(() => {
    if (!isOpen) return;

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        positionDropdown();
      }, 100); // 100ms debounce delay
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isOpen, positionDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={cn(
          'btn btn-bold aucctus-text-brand-primary group aspect-square w-10 hover:bg-primary-900 hover:text-white',
          className,
        )}
      >
        <span>
          <ClockArrowDown
            size={20}
            className='stroke-primary-900 transition-colors duration-300 group-hover:stroke-primary-100'
          />
        </span>
      </button>

      {isOpen &&
        portalContainer &&
        conceptUuid &&
        conceptIdentifier &&
        createPortal(
          <div
            ref={dropdownRef}
            className='animate-fade-in transition-all duration-200'
          >
            <ConceptVersionsDropdown
              conceptUuid={conceptUuid}
              conceptIdentifier={conceptIdentifier}
              onClose={() => setIsOpen(false)}
            />
          </div>,
          portalContainer,
        )}
    </>
  );
};

export default ConceptVersionsButton;
