import { ExternalLink } from 'lucide-react';
import type { Source } from '../types/analysis';

/** Strip common markdown syntax so snippets render as plain readable text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) → text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // ![alt](url) → alt
    .replace(/^#{1,6}\s+/gm, '')              // ## headings
    .replace(/\*\*(.+?)\*\*/g, '$1')          // **bold**
    .replace(/\*(.+?)\*/g, '$1')              // *italic*
    .replace(/__(.+?)__/g, '$1')              // __bold__
    .replace(/_(.+?)_/g, '$1')               // _italic_
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // `code`
    .replace(/^\s*[-*+]\s+/gm, '')           // bullet points
    .replace(/^\s*\d+\.\s+/gm, '')           // numbered lists
    .replace(/^>\s+/gm, '')                  // blockquotes
    .replace(/\n{2,}/g, ' ')                 // collapse multiple newlines
    .replace(/\n/g, ' ')                     // single newlines → space
    .trim();
}

export default function SourceCard({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-3.5 rounded-lg border border-border bg-surface hover:border-brand/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors truncate">
            {source.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">{source.publisher}</span>
            {source.date && (
              <>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs text-text-muted">{source.date}</span>
              </>
            )}
          </div>
          {source.snippet && (
            <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
              {stripMarkdown(source.snippet)}
            </p>
          )}
        </div>
        <ExternalLink
          size={14}
          className="text-text-muted group-hover:text-brand transition-colors shrink-0 mt-0.5"
        />
      </div>
    </a>
  );
}
