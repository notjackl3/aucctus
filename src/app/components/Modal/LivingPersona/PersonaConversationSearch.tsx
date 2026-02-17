import { Loading } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { usePersonaConversationSearch } from '@hooks/query/persona.hook';
import type { IPersonaConversationSearchResult } from '@libs/api/types/persona';
import { formatDate } from '@libs/utils/time';
import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Search, X } from 'lucide-react';

interface PersonaConversationSearchProps {
  personaUuid: string;
  onSelectConversation?: (
    conversation: IPersonaConversationSearchResult,
  ) => void;
}

const PersonaConversationSearch: React.FC<PersonaConversationSearchProps> = ({
  personaUuid,
  onSelectConversation,
}) => {
  const { closeModal } = useModal();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout>();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const { data: searchResults, isLoading: isSearching } =
    usePersonaConversationSearch(personaUuid, {
      message: debouncedQuery,
    });

  const results = searchResults?.results ?? [];

  const handleSelect = (result: IPersonaConversationSearchResult) => {
    onSelectConversation?.(result);
  };

  return (
    <div className='aucctus-bg-primary flex max-h-[500px] min-w-[500px] flex-col gap-4 rounded-lg'>
      <div className='aucctus-border-secondary flex flex-row gap-4 border-b'>
        <span className='flex flex-1'>
          <input
            type='text'
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder='Search conversations...'
            className='aucctus-text-primary flex-1 rounded-md p-3 !outline-none focus:!outline-none focus:!ring-0 focus:!ring-offset-0'
          />
          <Search className='aucctus-stroke-tertiary absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2' />
        </span>
        <span>
          <button
            onClick={closeModal}
            className='aucctus-bg-primary-hover flex items-center justify-center rounded-md p-3'
          >
            <X size={20} />
          </button>
        </span>
      </div>

      <div className='flex max-h-[300px] min-h-[300px] flex-grow flex-col'>
        <div className='no-scrollbar'>
          {isSearching ? (
            <div className='flex items-center justify-center py-4'>
              <Loading />
            </div>
          ) : results.length > 0 ? (
            <ul className='flex flex-col px-2'>
              {results
                .filter((result) => result.message?.content)
                .map((result, index) => (
                  <div
                    key={result.uuid}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className='aucctus-bg-primary-hover flex animate-fade-in cursor-pointer flex-row gap-2 rounded-md p-3 opacity-0'
                    onClick={() => handleSelect(result)}
                  >
                    <span className='flex items-center justify-center'>
                      <MessageCircle size={20} />
                    </span>
                    <div className='flex flex-col'>
                      {result.summary && (
                        <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                          {result.summary}
                        </span>
                      )}
                      <span className='aucctus-text-xs aucctus-text-tertiary'>
                        {result.message?.contentSnippet ||
                          result.message?.content?.slice(0, 80)}
                      </span>
                    </div>
                    <span className='flex flex-1' />
                    <span className='aucctus-text-xs aucctus-text-tertiary self-end'>
                      {formatDate(result.createdAt)}
                    </span>
                  </div>
                ))}
            </ul>
          ) : debouncedQuery.trim() !== '' ? (
            <div className='flex items-center justify-center py-4'>
              <p className='aucctus-text-secondary'>No results found</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PersonaConversationSearch;
