/**
 * PersonaConversationSidebar - Sidebar listing past chat sessions
 *
 * Displays a scrollable list of conversation sessions for the current persona.
 * Clicking a session loads it into the main chat area.
 */

import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '@libs/utils/react';
import { formatDate } from '@libs/utils/time';
import type { IChatSession } from '@libs/api/types/persona';

export interface PersonaConversationSidebarProps {
  sessions: IChatSession[];
  activeSessionUuid?: string;
  onSelectSession: (session: IChatSession) => void;
  className?: string;
}

const PersonaConversationSidebar: React.FC<PersonaConversationSidebarProps> = ({
  sessions,
  activeSessionUuid,
  onSelectSession,
  className,
}) => {
  if (sessions.length === 0) return null;

  return (
    <div
      className={cn(
        'aucctus-border-primary no-scrollbar flex w-[140px] shrink-0 flex-col gap-1 overflow-y-auto border-l p-2',
        className,
      )}
    >
      <p className='aucctus-text-xs-medium aucctus-text-tertiary mb-1 px-1'>
        Past Chats
      </p>
      {sessions.map((session, index) => {
        const isActive = session.uuid === activeSessionUuid;
        return (
          <motion.button
            key={session.uuid}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.2,
              delay: Math.min(index * 0.05, 0.3),
            }}
            onClick={() => onSelectSession(session)}
            className={cn(
              'w-full rounded-md px-2 py-1.5 text-left transition-colors',
              isActive ? 'aucctus-bg-quaternary' : 'aucctus-bg-primary-hover',
            )}
          >
            <p className='aucctus-text-xs aucctus-text-primary truncate'>
              {session.title || 'Untitled'}
            </p>
            <p className='aucctus-text-xs aucctus-text-quaternary'>
              {formatDate(session.startedAt)}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
};

export default PersonaConversationSidebar;
