import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

const Portal: React.FC<PortalProps> = ({
  children,
  containerId = 'dropdown-portal',
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    // Try to find existing portal container
    let container = document.getElementById(containerId);

    // Create container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.zIndex = '10000';
      container.style.pointerEvents = 'none'; // Allow clicks to pass through container
      document.body.appendChild(container);
    }

    setPortalContainer(container);

    // Cleanup function to remove container if we created it and it's empty
    return () => {
      if (
        container &&
        container.children.length === 0 &&
        container.id === containerId
      ) {
        try {
          document.body.removeChild(container);
        } catch (e) {
          // Container already removed
        }
      }
    };
  }, [containerId]);

  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
};

export default Portal;
