import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
  useMemo,
  useCallback,
} from 'react';
import Modal, { ModalPosition } from '../components/Modal/Modal/Modal';
import { createPortal } from 'react-dom';

interface ModalOptions {
  position?: ModalPosition;
  shouldCloseOnOverlayClick?: boolean;
  modalClassName?: string;
  backgroundClassName?: string;
  hideBodyScroll?: boolean;
}

interface ModalContextType {
  openModal: <T extends object>(
    Component: FunctionComponent<T>,
    props?: T,
    options?: ModalOptions,
  ) => void;
  closeModal: () => void;
  shouldCloseOnOverlayClick: boolean;
  className?: string;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

interface ModalProviderProps {
  children: ReactNode;
}

interface ModalState {
  isOpen: boolean;
  content: ReactNode;
  options: ModalOptions;
  isClosing: boolean;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    options: { position: 'center', shouldCloseOnOverlayClick: true },
    isClosing: false,
  });

  const openModal = useCallback(
    <T extends object>(
      Component: FunctionComponent<T>,
      props: T = {} as T,
      options: ModalOptions = { position: 'center' },
    ) => {
      if (options.hideBodyScroll) {
        document.body.style.overflow = 'hidden';
      }

      setModalState({
        isOpen: true,
        content: <Component {...props} />,
        options,
        isClosing: false,
      });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isClosing: true,
    }));

    const cleanup = () => {
      document.body.style.overflow = '';
      setModalState((prev) => ({
        ...prev,
        isOpen: false,
        content: null,
        isClosing: false,
      }));
    };

    setTimeout(cleanup, 300);
  }, []);

  const contextValue = useMemo(
    () => ({
      openModal,
      closeModal,
      shouldCloseOnOverlayClick:
        modalState.options.shouldCloseOnOverlayClick ?? true,
    }),
    [openModal, closeModal, modalState.options.shouldCloseOnOverlayClick],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modalState.isOpen &&
        createPortal(
          <Modal
            position={modalState.options.position ?? 'center'}
            modalClassName={modalState.options.modalClassName}
            backgroundClassName={modalState.options.backgroundClassName}
            isClosing={modalState.isClosing}
          >
            {modalState.content}
          </Modal>,
          document.body,
        )}
    </ModalContext.Provider>
  );
};
