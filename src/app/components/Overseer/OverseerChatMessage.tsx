import { cn } from '@libs/utils/react';
import {
  AgentStep,
  IOverseerAssistantMessage,
  IOverseerNavigateSuggestion,
  IOverseerUserMessage,
} from '@stores/overseer/types';
import useStore from '@stores/store';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import React, { ReactNode, useMemo } from 'react';
import AgentThinkingSteps from './AgentThinkingSteps';
import SourceBadges, { SourcePill } from './SourceBadges';

// Allowlist of semantic tags the agent may emit in assistant messages.
// Anything outside this list is stripped by DOMPurify.
const OVERSEER_ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'code',
  'pre',
  'blockquote',
  'br',
  'hr',
  'a',
  'span',
  'div',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
];

const OVERSEER_ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'rel',
  'colspan',
  'rowspan',
];

// Allow internal aucctus:// citation URIs alongside standard schemes.
// DOMPurify defaults strip non-http(s)/mailto/tel hrefs, which would erase
// the URI before nodeToReact swaps <a> for SourcePill.
const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto|tel|aucctus):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

function sanitizeAssistantHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: OVERSEER_ALLOWED_TAGS,
    ALLOWED_ATTR: OVERSEER_ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
  });
}

// React doesn't accept HTML attribute names directly — map the ones we pass through.
const ATTRIBUTE_MAP: Record<string, string> = {
  colspan: 'colSpan',
  rowspan: 'rowSpan',
};

function convertElementAttrs(el: Element): Record<string, string> {
  const props: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    const reactName = ATTRIBUTE_MAP[attr.name] ?? attr.name;
    props[reactName] = attr.value;
  }
  return props;
}

function nodeToReact(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  // Swap <a href="...">label</a> → <SourcePill source={{ url, name: label }} />
  if (tag === 'a') {
    const href = el.getAttribute('href') ?? undefined;
    const label = (el.textContent ?? href ?? '').trim();
    return <SourcePill key={key} source={label || (href ?? '')} url={href} />;
  }

  const children = Array.from(el.childNodes).map((child, i) =>
    nodeToReact(child, i),
  );
  const props = convertElementAttrs(el);
  // Void elements (no children allowed)
  if (tag === 'br' || tag === 'hr') {
    return React.createElement(tag, { key, ...props });
  }
  return React.createElement(
    tag,
    { key, ...props },
    children.length ? children : null,
  );
}

function htmlToReact(html: string): ReactNode[] {
  if (!html) return [];
  const sanitized = sanitizeAssistantHtml(html);
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return [];
  }
  const doc = new DOMParser().parseFromString(sanitized, 'text/html');
  return Array.from(doc.body.childNodes).map((node, i) => nodeToReact(node, i));
}

interface OverseerAssistantHtmlProps {
  html: string;
}

/**
 * Renders sanitized HTML for Overseer assistant messages.
 *
 * The agent emits a constrained set of semantic HTML tags
 * (see OVERSEER_ALLOWED_TAGS). DOMPurify strips anything outside the
 * allowlist. Styling is applied via tailwind `prose` plus per-element
 * arbitrary variants so tables/code/lists read correctly on the dark
 * glass card.
 */
const OverseerAssistantHtml: React.FC<OverseerAssistantHtmlProps> = ({
  html,
}) => {
  const children = useMemo(() => htmlToReact(html), [html]);

  return (
    <div
      className={cn(
        // Flex column container — natural vertical stacking, allows wide children
        // (e.g. tables) to participate in their own horizontal overflow
        'flex w-full min-w-0 flex-col gap-2',
        // Default text color is white; prose-invert styles headings/strong explicitly
        'prose prose-sm prose-invert max-w-none text-sm text-white',
        // Paragraphs / inline — inherit white by default
        'prose-p:my-1 prose-p:text-sm prose-p:text-white',
        'prose-strong:font-semibold prose-strong:text-white',
        'prose-em:italic prose-em:text-white',
        // Lists
        'prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4 prose-ul:text-white',
        'prose-ol:my-1 prose-ol:list-decimal prose-ol:pl-4 prose-ol:text-white',
        'prose-li:my-0.5 prose-li:text-sm prose-li:text-white',
        // Headings
        'prose-headings:my-2 prose-headings:text-white',
        'prose-h1:text-xl prose-h1:font-bold',
        'prose-h2:text-lg prose-h2:font-bold',
        'prose-h3:my-1 prose-h3:text-base prose-h3:font-semibold',
        'prose-h4:my-1 prose-h4:text-sm prose-h4:font-semibold',
        // Blockquote — muted on purpose for visual distinction
        'prose-blockquote:my-2 prose-blockquote:border-l-2 prose-blockquote:border-white/30 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-white/70',
        // Inline code
        '[&_code]:font-mono [&_code]:text-sm [&_code]:text-white',
        '[&_p>code]:rounded [&_p>code]:bg-white/10 [&_p>code]:px-1 [&_p>code]:py-0.5',
        '[&_li>code]:rounded [&_li>code]:bg-white/10 [&_li>code]:px-1 [&_li>code]:py-0.5',
        '[&_td>code]:rounded [&_td>code]:bg-white/10 [&_td>code]:px-1 [&_td>code]:py-0.5',
        // Code blocks
        '[&_pre]:my-2 [&_pre]:w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3',
        // Links
        '[&_a]:text-blue-300 [&_a]:underline hover:[&_a]:text-blue-200',
        // Horizontal rule
        '[&_hr]:my-4 [&_hr]:border-white/20',
        // Tables — wrap in a block so overflow-x works even inside prose
        '[&_table]:my-2 [&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:border-collapse [&_table]:overflow-x-auto [&_table]:text-left [&_table]:text-sm [&_table]:text-white',
        '[&_thead]:border-b [&_thead]:border-white/20',
        '[&_tr]:border-b [&_tr]:border-white/10',
        '[&_th]:whitespace-nowrap [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-white',
        '[&_td]:p-2 [&_td]:align-top [&_td]:text-white',
      )}
    >
      {children}
    </div>
  );
};

interface OverseerChatMessageProps {
  message: IOverseerUserMessage | IOverseerAssistantMessage;
  className?: string;
  toolActivitySteps?: AgentStep[];
  navigateSuggestion?: IOverseerNavigateSuggestion | null;
}

/**
 * Individual chat message component for Overseer
 * User messages: right-aligned with bg-white/10 bubble
 * Assistant messages: left-aligned, glass card with border, no avatar (Lovable style)
 */
const OverseerChatMessage: React.FC<OverseerChatMessageProps> = ({
  message,
  className,
  toolActivitySteps,
  navigateSuggestion,
}) => {
  const profileImage = useStore((state) => state.auth.user?.profileImage);
  const firstName = useStore((state) => state.auth.user?.firstName);
  const lastName = useStore((state) => state.auth.user?.lastName);

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('flex items-start justify-end gap-2', className)}
      >
        <div className='max-w-[85%] rounded-lg bg-white/10 px-3.5 py-2'>
          {message.images && message.images.length > 0 && (
            <div className='mb-1.5 flex flex-wrap gap-1'>
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={img.dataUrl}
                  alt={img.filename ?? `Image ${i + 1}`}
                  className='h-16 w-16 rounded border border-white/10 object-cover'
                />
              ))}
            </div>
          )}
          <div className='whitespace-pre-line text-[13px] font-light leading-relaxed text-white/90'>
            {message.content}
          </div>
        </div>
        <div className='h-[29px] w-[29px] flex-shrink-0 overflow-hidden rounded-md'>
          {profileImage ? (
            <img
              src={profileImage}
              alt={firstName ?? 'User'}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-white/15 text-[11px] font-medium text-white/60'>
              {firstName?.charAt(0) ?? ''}
              {lastName?.charAt(0) ?? ''}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex justify-start', className)}
    >
      <div className='flex min-w-0 max-w-[92%] flex-col gap-1.5'>
        {toolActivitySteps && toolActivitySteps.length > 0 && (
          <AgentThinkingSteps steps={toolActivitySteps} />
        )}
        <div
          className='min-w-0 rounded-lg border border-white/[0.08] px-4 py-3'
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          <OverseerAssistantHtml html={message.content} />
          {message.sources && message.sources.length > 0 && (
            <SourceBadges
              sources={message.sources.filter((s) => s.name && s.url)}
            />
          )}
        </div>
        {navigateSuggestion && <NavigateChip navigate={navigateSuggestion} />}
      </div>
    </motion.div>
  );
};

/**
 * Red-themed navigation chip (matching Lovable mockup).
 * Clicking triggers the section highlight overlay.
 */
const NavigateChip: React.FC<{ navigate: IOverseerNavigateSuggestion }> = ({
  navigate,
}) => {
  const setHighlightedSection = useStore(
    (state) => state.overseer.setHighlightedSection,
  );

  return (
    <button
      onClick={() => setHighlightedSection(navigate.sectionId)}
      className='mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors'
      style={{
        background: 'rgba(163,13,19,0.15)',
        borderColor: 'rgba(163,13,19,0.3)',
        color: 'rgba(255,180,180,0.9)',
      }}
    >
      <MapPin className='h-3 w-3' />
      {navigate.sectionName}
    </button>
  );
};

export default OverseerChatMessage;
