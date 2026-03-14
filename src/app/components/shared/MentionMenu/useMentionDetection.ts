import { useMemo } from 'react';

export interface MentionDetectionState {
  active: boolean;
  query: string;
  index: number;
}

/**
 * Detects @ mention triggers in a text value.
 * Returns whether a mention is active, the search query after @, and the @ position.
 *
 * Rules:
 * - @ must be at the start of text or preceded by a space
 * - If there's a space after the @, the mention input is considered done
 */
export function useMentionDetection(value: string): MentionDetectionState {
  return useMemo(() => {
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex === -1) return { active: false, query: '', index: -1 };

    // @ must be at start or preceded by a space
    if (lastAtIndex > 0 && value[lastAtIndex - 1] !== ' ') {
      return { active: false, query: '', index: -1 };
    }

    const textAfterAt = value.slice(lastAtIndex + 1);

    // If there's a space after @, mention input is done
    if (textAfterAt.includes(' ')) {
      return { active: false, query: '', index: -1 };
    }

    return { active: true, query: textAfterAt, index: lastAtIndex };
  }, [value]);
}
