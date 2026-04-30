import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

  // Reset selected scan when *switching* towers (i.e. transitioning between
  // two distinct defined configs). Skip the reset on initial transitions
  // from `undefined` so that cold-load deep-links like /watchtower?scan=<uuid>
  // — which set selectedScanUuid via useWatchtowerUrlSync before the active
  // config has been resolved — don't get wiped when the config arrives.
  const prevActiveConfigRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prev = prevActiveConfigRef.current;
    prevActiveConfigRef.current = activeWatchtowerConfigUuid;
    if (
      prev !== undefined &&
      activeWatchtowerConfigUuid !== undefined &&
      prev !== activeWatchtowerConfigUuid
    ) {
      setSelectedScanUuid(undefined);
    }
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
