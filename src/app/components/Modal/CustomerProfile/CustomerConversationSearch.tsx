import { Icon, Loading } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useConceptCustomerProfileConversationList } from '@hooks/query/concepts.hook';
import { IConversation } from '@libs/api/types';
import React, { useEffect, useRef, useState } from 'react';
import ConversationSearchResult from './ConversationSearchResult';

interface CustomerConversationSearchProps {
  customerProfileUuid: string;
  onSelectConversation?: (conversation: IConversation) => void;
}

const CustomerConversationSearch: React.FC<CustomerConversationSearchProps> = ({
  customerProfileUuid,
  onSelectConversation,
}) => {
  const { closeModal } = useModal();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout>();

  // Handle input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  };

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Use debounced query for API calls
  const { data: searchResults = [], isLoading: isSearching } =
    useConceptCustomerProfileConversationList(customerProfileUuid, {
      message: debouncedQuery,
    });

  const handleSelectConversation = (conversation: IConversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  return (
    <div className='aucctus-bg-primary flex max-h-[500px] min-w-[500px] flex-col gap-4 rounded-lg'>
      <div className='aucctus-border-secondary flex flex-row gap-4 border-b'>
        <span className='flex flex-1'>
          <input
            type='text'
            value={searchQuery}
            onChange={handleSearchChange}
            className='aucctus-text-primary flex-1 rounded-md p-3 !outline-none focus:!outline-none focus:!ring-0 focus:!ring-offset-0'
          />
          <Icon
            variant='search-md'
            className='aucctus-fill-tertiary absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2'
          />
        </span>
        <span>
          <button
            onClick={closeModal}
            className='aucctus-bg-primary-hover flex items-center justify-center rounded-md p-3'
          >
            <Icon variant='closeX' width={20} height={20} />
          </button>
        </span>
      </div>

      <div className='flex max-h-[300px] min-h-[300px] flex-grow flex-col'>
        <div className='no-scrollbar'>
          {isSearching ? (
            <div className='flex items-center justify-center py-4'>
              <Loading />
            </div>
          ) : searchResults.length > 0 ? (
            <ul className='flex flex-col px-2'>
              {searchResults
                .filter((result) => result.message.content)
                .map((result, index) => (
                  <ConversationSearchResult
                    key={result.uuid}
                    result={result}
                    index={index}
                    onClick={handleSelectConversation}
                  />
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

export default CustomerConversationSearch;
