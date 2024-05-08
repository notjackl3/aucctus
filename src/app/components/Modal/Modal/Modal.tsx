import React, { FunctionComponent, useEffect, useRef } from 'react';
import { useModal } from '../../../context/ModalContextProvider';

import styles from './modal.module.scss';

interface IModalProps {
  children: React.ReactNode;
}

const Modal: FunctionComponent<IModalProps> = ({ children }) => {
  const { closeModal, shouldCloseOnOverlayClick } = useModal();
  const contentRef = useRef<HTMLDivElement>(null);

  // Effect to add and clean up the event listener based on shouldCloseOnOverlayClick
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shouldCloseOnOverlayClick && contentRef.current && !contentRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    // Conditionally add click event listener to the document
    if (shouldCloseOnOverlayClick) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up function that removes the event listener
    return () => {
      if (shouldCloseOnOverlayClick) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [closeModal, shouldCloseOnOverlayClick]); // include shouldCloseOnOverlayClick in the dependency array

  return (
    <div className={styles.overlay}>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
