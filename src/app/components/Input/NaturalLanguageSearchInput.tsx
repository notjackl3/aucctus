import { Icon } from '@components';
import { toast } from '@components/Notification/toast';
import { IPropertyFilter } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useState, useCallback, useRef } from 'react';
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

interface INaturalLanguageSearchInputProps {
  onFiltersApplied: (
    filters: IPropertyFilter[],
    standardFilters?: IStandardFilter[],
  ) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

/**
 * Natural Language Search Input
 * A search bar that translates natural language queries to structured filters
 * Debounces input and calls the API when user stops typing
 */
const NaturalLanguageSearchInput: React.FC<
  INaturalLanguageSearchInputProps
> = ({
  onFiltersApplied,
  placeholder = 'Search with natural language...',
  className,
  debounceMs = 800,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        // Clear filters when search is empty
        onFiltersApplied([], []);
        return;
      }

      if (!accountUuid) {
        toast.error('Account not found');
        return;
      }

      setIsLoading(true);

      try {
        const response = await api.property.translateQuery(
          accountUuid,
          searchQuery.trim(),
        );

        // Check for propertyFilters in the new response format
        const hasPropertyFilters =
          response.propertyFilters && response.propertyFilters.length > 0;

        // Check for standardFilters (sort, status, etc.)
        const hasStandardFilters =
          response.standardFilters && response.standardFilters.length > 0;

        // Also check legacy filters format for backward compatibility
        const hasLegacyFilters =
          response.filters && response.filters.length > 0;

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
                  filterType: toCamelCase(
                    filter.filterType,
                  ) as IStandardFilter['filterType'],
                  value: filter.value,
                }))
              : undefined;

          // Apply the filters
          onFiltersApplied(propertyFilters, standardFilters);

          // Show success message with explanation
          if (response.explanation) {
            toast.success(response.explanation);
          }
        } else {
          // No filters generated
          if (
            response.noResultsExplanation &&
            (response.noResultsExplanation.trim() === '-' ||
              response.noResultsExplanation.length < 3)
          ) {
            // Clear all filters and sorts
            onFiltersApplied([], []);
          } else {
            const noResultsMessage =
              response.noResultsExplanation ||
              response.explanation ||
              'No filters could be generated from your query.';
            toast.warning(noResultsMessage);
          }
        }
      } catch (error: any) {
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
    },
    [accountUuid, onFiltersApplied],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setQuery(newValue);

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the search
      debounceTimeoutRef.current = setTimeout(() => {
        handleSearch(newValue);
      }, debounceMs);
    },
    [handleSearch, debounceMs],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Clear debounce and search immediately
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        handleSearch(query);
      }
    },
    [handleSearch, query],
  );

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      <div className='absolute inset-y-0 left-0 flex items-center pl-3'>
        {isLoading ? (
          <Icon
            variant='loading-02'
            className='aucctus-stroke-brand-primary h-4 w-4 animate-spin'
          />
        ) : (
          <Icon
            variant='ai-conclusion'
            className={cn('h-4 w-4', {
              'aucctus-stroke-tertiary': !isFocused,
              'aucctus-stroke-brand-primary': isFocused,
            })}
          />
        )}
      </div>
      <input
        type='text'
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          'aucctus-bg-primary aucctus-border-secondary aucctus-text-primary',
          'placeholder:aucctus-text-placeholder',
          'focus:aucctus-border-brand focus:ring-1 focus:ring-blue-500',
          'w-full rounded-lg border py-2 pl-10 pr-4 text-sm',
          'transition-colors focus:outline-none',
        )}
        disabled={isLoading}
      />
    </div>
  );
};

export default NaturalLanguageSearchInput;
