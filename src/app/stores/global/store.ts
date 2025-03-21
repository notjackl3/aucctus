import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IGlobalActions } from './actions';

export interface IGlobalState extends IGlobalActions {
  testing: string;
}

const globalSlice: Lens<IGlobalState, IAppStore> = (set, get, storeApi) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const actionContext = { set, get, storeApi };

  return {
    testing: 'test',
  };
};

export default lens<IGlobalState, IAppStore>(globalSlice);
