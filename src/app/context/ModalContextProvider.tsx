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

interface ModalOptions {
  position?: ModalPosition;
  shouldCloseOnOverlayClick?: boolean;
}

interface ModalContextType {
  openModal: <T extends object>(
    Component: FunctionComponent<T>,
    props?: T,
    options?: ModalOptions,
  ) => void;
  closeModal: () => void;
  shouldCloseOnOverlayClick: boolean;
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
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    options: { position: 'center', shouldCloseOnOverlayClick: true },
  });

  const openModal = useCallback(
    <T extends object>(
      Component: FunctionComponent<T>,
      props: T = {} as T,
      options: ModalOptions = { position: 'center' },
    ) => {
      setModalState({
        isOpen: true,
        content: <Component {...props} />,
        options,
      });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      content: null,
    }));
  }, []);

  // Only these functions are provided via context—children that use useModal()
  // won't re-render when modalState changes.
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
      {modalState.isOpen && (
        <Modal position={modalState.options.position ?? 'center'}>
          {modalState.content}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};
