import { MentionItem } from '@stores/overseer/types';
import React, { useMemo } from 'react';
import {
  MentionMenu,
  buildMentionSections,
} from '@components/shared/MentionMenu';

interface OverseerMentionMenuProps {
  query: string;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  visible: boolean;
  concepts?: MentionItem[];
  personas?: MentionItem[];
}

/**
 * Overseer-specific mention menu wrapper.
 * Dark theme variant positioned above the input field.
 */
const OverseerMentionMenu: React.FC<OverseerMentionMenuProps> = ({
  query,
  onSelect,
  onClose,
  visible,
  concepts = [],
  personas = [],
}) => {
  const sections = useMemo(
    () => buildMentionSections(personas, concepts),
    [personas, concepts],
  );

  return (
    <MentionMenu
      query={query}
      onSelect={onSelect}
      onClose={onClose}
      visible={visible}
      sections={sections}
      className='absolute bottom-full left-0 right-0 z-50 mb-0 max-h-[140px] overflow-y-auto rounded-lg rounded-b-none border border-b-0 border-white/15 bg-black/90 shadow-2xl backdrop-blur-xl'
    />
  );
};

export default OverseerMentionMenu;
