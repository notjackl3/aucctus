import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@libs/utils/react';
import { Icon } from '@components';
import ConceptVersionsDropdown from './Dropdown/ConceptVersionsDropdown';

interface ConceptVersionsButtonProps {
  conceptUuid?: string;
  className?: string;
}

const ConceptVersionsButton: React.FC<ConceptVersionsButtonProps> = ({
  conceptUuid,
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
    document.body.appendChild(div);
    setPortalContainer(div);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  // Position dropdown below button
  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current && portalContainer) {
      const buttonRect = buttonRef.current.getBoundingClientRect();

      // Calculate left position to ensure dropdown stays within viewport
      let leftPosition = buttonRect.left + window.scrollX - 100;

      // Check if dropdown would extend beyond right edge of viewport
      if (leftPosition > window.innerWidth + 20) {
        // Adjust position to align with right edge of viewport
        leftPosition = Math.max(0, window.innerWidth - 20);
      }

      // Position dropdown below the button
      portalContainer.style.position = 'absolute';
      portalContainer.style.top = `${buttonRect.bottom + window.scrollY}px`;
      portalContainer.style.left = `${leftPosition}px`;
      portalContainer.style.minWidth = `250px`;
      portalContainer.style.zIndex = '50';
    }
  }, [isOpen, portalContainer]);

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
          <Icon
            variant='clock-rewind'
            height={20}
            width={20}
            className='stroke-primary-900 transition-colors duration-300 group-hover:stroke-primary-100'
          />
        </span>
      </button>

      {isOpen &&
        portalContainer &&
        conceptUuid &&
        createPortal(
          <div ref={dropdownRef} className='animate-fade-in'>
            <ConceptVersionsDropdown
              conceptUuid={conceptUuid}
              onClose={() => setIsOpen(false)}
            />
          </div>,
          portalContainer,
        )}
    </>
  );
};

export default ConceptVersionsButton;
