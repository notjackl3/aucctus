/**
 * Slash command definitions for Overseer
 *
 * These commands provide quick access to specific agent capabilities
 * via the "/" prefix in the Overseer input.
 *
 * Supports both built-in commands and custom commands defined by users.
 */

import { CustomCommandForPicker } from '@libs/api/types';

/**
 * Slash command definition
 */
export interface SlashCommand {
  /** The command string including "/" prefix (e.g., '/edit') */
  command: string;
  /** Display label for the command (e.g., 'Edit') */
  label: string;
  /** Description shown in the command picker */
  description: string;
  /** Icon variant from the icon sprite */
  icon: IconVariant;
  /** Whether this command requires selected text to function */
  requiresSelection?: boolean;
  /** Whether this command is handled entirely on the frontend */
  frontendOnly?: boolean;
  /** Placeholder text to show after command is selected */
  placeholder?: string;
  /** Whether this is a custom command (user-defined) */
  isCustom?: boolean;
}

/**
 * Available slash commands
 *
 * Commands are processed by the backend unless marked as frontendOnly.
 * The backend will hard-enforce tool usage based on the command.
 */
export const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/edit',
    label: 'Edit',
    description: 'Edit content with AI assistance',
    icon: 'edit',
    requiresSelection: true,
    placeholder: 'Describe how to edit the selected content...',
  },
  {
    command: '/web',
    label: 'Web Search',
    description: 'Search the web for information',
    icon: 'globe',
    placeholder: 'What would you like to search for?',
  },
  {
    command: '/nucleus',
    label: 'Nucleus',
    description: 'Search company knowledge base',
    icon: 'compass-03',
    placeholder: 'What would you like to find in Nucleus?',
  },
  {
    command: '/summarize',
    label: 'Summarize',
    description: 'Summarize selected content',
    icon: 'file-text',
    requiresSelection: true,
    placeholder: 'Any specific focus for the summary?',
  },
  {
    command: '/help',
    label: 'Help',
    description: 'Show available commands',
    icon: 'help-circle',
    frontendOnly: true,
  },
];

/**
 * Get a command by its string value
 */
export function getSlashCommand(command: string): SlashCommand | undefined {
  return SLASH_COMMANDS.find(
    (cmd) => cmd.command.toLowerCase() === command.toLowerCase(),
  );
}

/**
 * Filter commands based on partial input
 * Supports fuzzy matching (e.g., "ed" matches "/edit")
 *
 * @param filter - The filter string to match against
 * @param customCommands - Optional array of custom commands to include
 */
export function filterSlashCommands(
  filter: string,
  customCommands?: CustomCommandForPicker[],
): SlashCommand[] {
  // Convert custom commands to SlashCommand format
  const customSlashCommands: SlashCommand[] = (customCommands || []).map(
    (cmd) => ({
      command: `/${cmd.name}`,
      label: cmd.label,
      description: cmd.description,
      icon: cmd.icon as IconVariant,
      isCustom: true,
      placeholder: 'Enter your request...',
    }),
  );

  // Combine built-in and custom commands
  const allCommands = [...SLASH_COMMANDS, ...customSlashCommands];

  if (!filter) {
    return allCommands;
  }

  const normalizedFilter = filter.toLowerCase();

  return allCommands.filter((cmd) => {
    // Match against command (without /) or label
    const commandWithoutSlash = cmd.command.slice(1).toLowerCase();
    const label = cmd.label.toLowerCase();

    return (
      commandWithoutSlash.includes(normalizedFilter) ||
      label.includes(normalizedFilter)
    );
  });
}

/**
 * Get all commands including custom commands
 */
export function getAllCommands(
  customCommands?: CustomCommandForPicker[],
): SlashCommand[] {
  return filterSlashCommands('', customCommands);
}

/**
 * Parse a message to extract slash command and remaining content
 *
 * @returns [command, remainingContent, prefix, suffix]
 */
export function parseSlashCommand(
  message: string,
  options: {
    matchPosition?: 'start' | 'any';
    trimRemaining?: boolean;
  } = {},
): [SlashCommand | null, string, string, string] {
  const { matchPosition = 'start', trimRemaining = true } = options;
  const source = matchPosition === 'start' ? message.trimStart() : message;

  if (!source.includes('/')) {
    return [null, message, '', ''];
  }

  const normalizeRemaining = (remaining: string) => {
    const withoutLeading = remaining.replace(/^\s+/, '');
    return trimRemaining ? withoutLeading.trim() : withoutLeading;
  };

  if (matchPosition === 'start') {
    if (!source.startsWith('/')) {
      return [null, message, '', ''];
    }

    const commandMatch = source.match(/^\/\S+/);
    if (!commandMatch) {
      return [null, message, '', ''];
    }

    const commandStr = commandMatch[0].replace(/[.,;:!?]+$/, '');
    const command = getSlashCommand(commandStr);
    if (!command) {
      return [null, message, '', ''];
    }

    const remaining = source.slice(commandMatch[0].length);
    return [command, normalizeRemaining(remaining), '', remaining];
  }

  // Match last valid command anywhere in the message.
  // Later commands override earlier ones so only one command is active at a time.
  let bestMatch: { command: SlashCommand; start: number; end: number } | null =
    null;
  const tokenRegex = /(^|\s)(\/\S+)/g;
  let match: RegExpExecArray | null = null;

  while ((match = tokenRegex.exec(source)) !== null) {
    const token = match[2];
    const tokenStripped = token.replace(/[.,;:!?]+$/, '');
    const command = getSlashCommand(tokenStripped);
    if (!command) {
      continue;
    }

    const start = match.index + match[1].length;
    const end = start + token.length;
    bestMatch = { command, start, end };
  }

  if (bestMatch) {
    const suffix = source.slice(bestMatch.end);
    return [bestMatch.command, normalizeRemaining(suffix), '', suffix];
  }

  // Command not found, return original message
  return [null, message, '', ''];
}

/**
 * Generate help text for all available commands
 */
export function generateHelpText(): string {
  const lines = ['**Available Commands:**', ''];

  for (const cmd of SLASH_COMMANDS) {
    if (!cmd.frontendOnly || cmd.command === '/help') {
      lines.push(`- \`${cmd.command}\` — ${cmd.description}`);
    }
  }

  lines.push('');
  lines.push('_Type a command followed by your request._');

  return lines.join('\n');
}
