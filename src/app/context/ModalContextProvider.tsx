import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
} from 'react';
import Modal from '../components/Modal/Modal/Modal';

interface ModalContextType {
  isOpen: boolean;
  /**
   * Boolean to determine if the modal should close when the overlay is clicked.
   * Resets to True when the modal is closed.
   */
  shouldCloseOnOverlayClick: boolean;
  setShouldCloseOnOverlayClickClick: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  openModal: <T extends object>(
    Component: FunctionComponent<T>,
    props?: T,
  ) => void;
  closeModal: () => void;
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

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [shouldCloseOnOverlayClick, setShouldCloseOnOverlayClickClick] =
    useState<boolean>(true);

  const openModal = <T extends object>(
    Component: FunctionComponent<T>,
    props: T = {} as T,
  ) => {
    setContent(<Component {...props} />);
    setIsOpen(true);
  };

  const closeModal = () => {
    setShouldCloseOnOverlayClickClick;
    setIsOpen(false);
    setShouldCloseOnOverlayClickClick(true);
    setContent(null);
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        shouldCloseOnOverlayClick,
        setShouldCloseOnOverlayClickClick,
      }}
    >
      {children}
      {isOpen && <Modal>{content}</Modal>}
    </ModalContext.Provider>
  );
};
