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
  selectedJobUuid: string | null;
  setSelectedJobUuid: (
    uuid: string | null | ((prev: string | null) => string | null),
  ) => void;
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
  const [selectedJobUuid, setSelectedJobUuid] = useState<string | null>(null);

  // Clear edit config and selected job when switching configs
  useEffect(() => {
    setEditConfigUuid(undefined);
    setSelectedJobUuid(null);
  }, [activeConfigUuid]);

  const value = useMemo(
    () => ({
      activeConfigUuid,
      setActiveConfigUuid,
      showCreateModal,
      setShowCreateModal,
      editConfigUuid,
      setEditConfigUuid,
      selectedJobUuid,
      setSelectedJobUuid,
    }),
    [activeConfigUuid, showCreateModal, editConfigUuid, selectedJobUuid],
  );

  return (
    <JTBDViewContext.Provider value={value}>
      {children}
    </JTBDViewContext.Provider>
  );
};
