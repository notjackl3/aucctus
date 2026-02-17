import { Icon } from '@components';
import { toast } from '@components/Notification/toast';
import { IPropertyFilter } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@libs/api';
import useStore from '@stores/store';

interface IStandardFilter {
  filterType: 'sort' | 'status' | 'createdBy' | 'lastModifiedBy' | 'search';
  value: string | string[];
}

/**
 * Converts snake_case to camelCase
 * e.g., "created_by" -> "createdBy"
 */
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

interface INaturalLanguageFilterButtonProps {
  onFiltersApplied: (
    filters: IPropertyFilter[],
    standardFilters?: IStandardFilter[],
  ) => void;
  className?: string;
}

/**
 * Natural Language Filter Button
 * Allows users to enter natural language queries that are translated to structured filters
 */
const NaturalLanguageFilterButton: React.FC<
  INaturalLanguageFilterButtonProps
> = ({ onFiltersApplied, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');

  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (!accountUuid) {
      toast.error('Account not found');
      return;
    }

    setIsLoading(true);
    setExplanation('');

    try {
      const response = await api.property.translateQuery(
        accountUuid,
        query.trim(),
      );

      // Check for propertyFilters in the new response format
      const hasPropertyFilters =
        response.propertyFilters && response.propertyFilters.length > 0;

      // Check for standardFilters (sort, status, etc.)
      const hasStandardFilters =
        response.standardFilters && response.standardFilters.length > 0;

      // Also check legacy filters format for backward compatibility
      const hasLegacyFilters = response.filters && response.filters.length > 0;

      if (hasPropertyFilters || hasLegacyFilters || hasStandardFilters) {
        // Convert the API response to IPropertyFilter format
        const propertyFilters: IPropertyFilter[] = hasPropertyFilters
          ? response.propertyFilters.map((filter) => ({
              key: filter.key,
              value: filter.value,
              operator: filter.operator as IPropertyFilter['operator'],
            }))
          : (response.filters || []).map((filter) => ({
              key: filter.key,
              value: filter.value,
              operator: filter.operator as IPropertyFilter['operator'],
            }));

        // Extract standardFilters if present
        const standardFilters: IStandardFilter[] | undefined =
          hasStandardFilters
            ? response.standardFilters.map((filter) => ({
                // Convert snake_case to camelCase (e.g., "created_by" -> "createdBy")
                filterType: toCamelCase(
                  filter.filterType,
                ) as IStandardFilter['filterType'],
                value: filter.value,
              }))
            : undefined;

        // Apply the filters
        onFiltersApplied(propertyFilters, standardFilters);

        // Show success message with explanation
        toast.success(response.explanation || 'Filters applied successfully');

        // Close the popover
        setIsOpen(false);
        setQuery('');
        setExplanation('');
      } else {
        // No filters generated
        // Check if noResultsExplanation is '-' which means we should clear all filters
        if (
          response.noResultsExplanation &&
          (response.noResultsExplanation.trim() === '-' ||
            response.noResultsExplanation.length < 3)
        ) {
          // Clear all filters and sorts
          onFiltersApplied([], []);
          toast.success('All filters and sorts cleared');

          // Close the popover
          setIsOpen(false);
          setQuery('');
          setExplanation('');
        } else {
          // Prioritize noResultsExplanation if available, otherwise fall back to explanation
          const noResultsMessage =
            response.noResultsExplanation ||
            response.explanation ||
            'No filters could be generated from your query. Try being more specific.';

          setExplanation(noResultsMessage);
          toast.warning('No filters found. Try rephrasing your query.');
        }
      }
    } catch (error: any) {
      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error translating query:', error);
      }
      toast.error(
        error?.message || 'Failed to translate query. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      setExplanation('');
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'aucctus-bg-secondary-hover flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200',
            className,
          )}
          title='Search with natural language'
        >
          <Icon
            variant='ai-conclusion'
            height={16}
            width={16}
            className='aucctus-stroke-brand-primary'
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {isOpen && (
            <Popover.Content asChild forceMount align='end' sideOffset={8}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className='aucctus-bg-primary z-[9999] flex w-[400px] flex-col rounded-md shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
              >
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className='aucctus-border-secondary flex items-center justify-between border-b px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        variant='ai-conclusion'
                        className='aucctus-stroke-brand-primary h-4 w-4'
                      />
                      <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
                        Natural Language Search
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        setExplanation('');
                      }}
                      className='aucctus-bg-primary-hover rounded p-1 transition-colors'
                    >
                      <Icon
                        variant='closeX'
                        className='aucctus-stroke-secondary h-4 w-4'
                      />
                    </button>
                  </div>

                  <div className='p-3'>
                    {/* Description */}
                    <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
                      Describe what you&apos;re looking for in natural language
                    </p>

                    {/* Input */}
                    <div className='mb-3'>
                      <input
                        type='text'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='e.g., "Find all high priority tests marked for deletion"'
                        className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary placeholder:aucctus-text-placeholder focus:aucctus-border-brand w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>

                    {/* Explanation */}
                    {explanation && (
                      <div className='aucctus-bg-warning-subtle aucctus-border-warning-extra-subtle mb-3 rounded-md border p-3'>
                        <p className='aucctus-text-xs aucctus-text-warning-primary'>
                          {explanation}
                        </p>
                      </div>
                    )}

                    {/* Examples */}
                    <div className='aucctus-bg-secondary mb-3 rounded-md p-3'>
                      <p className='aucctus-text-xs aucctus-text-tertiary mb-2 font-medium'>
                        Example queries:
                      </p>
                      <ul className='aucctus-text-xs aucctus-text-quaternary space-y-1'>
                        <li>• &quot;High priority concepts&quot;</li>
                        <li>• &quot;Team size greater than 5&quot;</li>
                        <li>• &quot;Concepts marked for deletion&quot;</li>
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          setIsOpen(false);
                          setQuery('');
                          setExplanation('');
                        }}
                        className='aucctus-text-secondary hover:aucctus-text-primary rounded-md px-3 py-1.5 text-sm transition-colors'
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type='submit'
                        disabled={isLoading || !query.trim()}
                        className={cn(
                          'aucctus-bg-brand-solid hover:aucctus-bg-brand-solid-hover flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors',
                          (isLoading || !query.trim()) &&
                            'cursor-not-allowed opacity-50',
                        )}
                      >
                        {isLoading ? (
                          <>
                            <Icon
                              variant='loading-02'
                              className='aucctus-stroke-white h-4 w-4 animate-spin'
                            />
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <Icon
                              variant='search-md'
                              className='aucctus-stroke-white h-4 w-4'
                            />
                            <span>Search</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NaturalLanguageFilterButton;
