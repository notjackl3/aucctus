import { IAISuggestion } from '@libs/api/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type IncubationAISuggestions = {
  [key: string]: IAISuggestion[];
};

interface IncubationStoreState {
  suggestions: IncubationAISuggestions;
  setSuggestions: (identifier: string, suggestions: IAISuggestion[]) => void;
}

export const useIncubationStore = create<IncubationStoreState>()(
  persist(
    (set, get) => ({
      suggestions: {},

      setSuggestions: (identifier: string, aiSuggestions: IAISuggestion[]) => {
        set({
          suggestions: { ...get().suggestions, [identifier]: aiSuggestions },
        });
      },
    }),
    {
      name: 'incubation-store',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
