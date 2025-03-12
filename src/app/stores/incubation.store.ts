import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface IAISuggestions {
  title: string;
  description: string;
}

type IncubationAISuggestions = {
  [key: string]: IAISuggestions[];
};

interface IncubationStoreState {
  suggestions: IncubationAISuggestions;
  setSuggestions: (identifier: string, suggestions: IAISuggestions[]) => void;
}

export const useIncubationStore = create<IncubationStoreState>()(
  persist(
    (set, get) => ({
      suggestions: {},

      setSuggestions: (identifier: string, aiSuggestions: IAISuggestions[]) => {
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
