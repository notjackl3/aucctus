import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AucctusStorage } from '../../../libs/localStorage';

export const useConceptUuid = () => {
  const { id } = useParams();
  const conceptUuidFromLocalStorage = AucctusStorage.get('conceptUuid') || undefined;

  const conceptUuid = id || conceptUuidFromLocalStorage;

  useEffect(() => {
    if (!conceptUuid) return;

    AucctusStorage.set('conceptUuid', conceptUuid);

    return () => {
      AucctusStorage.remove('conceptUuid');
    };
  }, [conceptUuid]);

  return conceptUuid;
};
