import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AucctusLocalStorage } from '../../../libs/localStorage';

export const useConceptUuid = () => {
  const { id } = useParams();
  const conceptUuidFromLocalStorage = AucctusLocalStorage.get('conceptUuid') || undefined;

  const conceptUuid = id || conceptUuidFromLocalStorage;

  useEffect(() => {
    if (!conceptUuid) return;

    AucctusLocalStorage.set('conceptUuid', conceptUuid);

    return () => {
      AucctusLocalStorage.remove('conceptUuid');
    };
  }, [conceptUuid]);

  return conceptUuid;
};
