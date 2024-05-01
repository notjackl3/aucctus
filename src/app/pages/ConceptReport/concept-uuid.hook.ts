import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AucctusLocalStorage, LocalStorageKeys } from '../../../libs/localStorage';

export const useConceptUuid = () => {
  const { id } = useParams();
  const conceptUuidFromLocalStorage = AucctusLocalStorage.get(LocalStorageKeys.ConceptReportUuid) || undefined;

  const conceptUuid = id || conceptUuidFromLocalStorage;

  useEffect(() => {
    if (!conceptUuid) return;

    AucctusLocalStorage.set(LocalStorageKeys.ConceptReportUuid, conceptUuid);

    return () => {
      AucctusLocalStorage.remove(LocalStorageKeys.ConceptReportUuid);
    };
  }, [conceptUuid]);

  return conceptUuid;
};
