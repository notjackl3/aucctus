import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface JTBDViewContextValue {
  activeConfigUuid: string | undefined;
  setActiveConfigUuid: (uuid: string | undefined) => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  editConfigUuid: string | undefined;
  setEditConfigUuid: (uuid: string | undefined) => void;
}

const JTBDViewContext = createContext<JTBDViewContextValue | null>(null);

export const useJTBDView = () => {
  const ctx = useContext(JTBDViewContext);
  if (!ctx) {
    throw new Error('useJTBDView must be used within a JTBDViewProvider');
  }
  return ctx;
};

export const JTBDViewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeConfigUuid, setActiveConfigUuid] = useState<string | undefined>(
    undefined,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editConfigUuid, setEditConfigUuid] = useState<string | undefined>(
    undefined,
  );
  // Clear edit config when switching configs
  useEffect(() => {
    setEditConfigUuid(undefined);
  }, [activeConfigUuid]);

  const value = useMemo(
    () => ({
      activeConfigUuid,
      setActiveConfigUuid,
      showCreateModal,
      setShowCreateModal,
      editConfigUuid,
      setEditConfigUuid,
    }),
    [activeConfigUuid, showCreateModal, editConfigUuid],
  );

  return (
    <JTBDViewContext.Provider value={value}>
      {children}
    </JTBDViewContext.Provider>
  );
};
