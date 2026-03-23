import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface WatchtowerViewContextValue {
  activeWatchtowerConfigUuid: string | undefined;
  setActiveWatchtowerConfigUuid: (uuid: string | undefined) => void;
  selectedScanUuid: string | undefined;
  setSelectedScanUuid: (uuid: string | undefined) => void;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
}

const WatchtowerViewContext = createContext<WatchtowerViewContextValue | null>(
  null,
);

export const useWatchtowerView = () => {
  const ctx = useContext(WatchtowerViewContext);
  if (!ctx) {
    throw new Error(
      'useWatchtowerView must be used within a WatchtowerViewProvider',
    );
  }
  return ctx;
};

export const WatchtowerViewProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [activeWatchtowerConfigUuid, setActiveWatchtowerConfigUuid] = useState<
    string | undefined
  >(undefined);
  const [selectedScanUuid, setSelectedScanUuid] = useState<string | undefined>(
    undefined,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Reset selected scan when switching towers since scan UUIDs
  // belong to a specific config and are not interchangeable.
  useEffect(() => {
    setSelectedScanUuid(undefined);
  }, [activeWatchtowerConfigUuid]);

  const value = useMemo(
    () => ({
      activeWatchtowerConfigUuid,
      setActiveWatchtowerConfigUuid,
      selectedScanUuid,
      setSelectedScanUuid,
      showCreateModal,
      setShowCreateModal,
    }),
    [activeWatchtowerConfigUuid, selectedScanUuid, showCreateModal],
  );

  return (
    <WatchtowerViewContext.Provider value={value}>
      {children}
    </WatchtowerViewContext.Provider>
  );
};
