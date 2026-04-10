import { useEffect, useState } from 'react';
import { ExternalLink, FileText, Globe, Loader2, X, Search } from 'lucide-react';
import { lookupSources } from '../api/client';
import type { WebSource, DocSource } from '../api/client';

interface Props {
  workspaceId: string;
  highlightedText: string;
  insightId?: string;
  blockCategory?: string;
  blockLabel?: string;
  onClose: () => void;
}

export default function SourcePanel({
  workspaceId,
  highlightedText,
  insightId,
  blockCategory,
  blockLabel,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const [docSources, setDocSources] = useState<DocSource[]>([]);

  useEffect(() => {
    lookupSources(workspaceId, highlightedText, insightId, blockCategory)
      .then(({ web_sources, doc_sources }) => {
        setWebSources(web_sources);
        setDocSources(doc_sources);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId, highlightedText, insightId, blockCategory]);

  const hasResults = webSources.length > 0 || docSources.length > 0;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-50 bg-white border-l border-border shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Sources</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} className="text-text-muted" />
        </button>
      </div>

      {/* Selected text context */}
      <div className="px-5 py-3 border-b border-border bg-gray-50">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
          Selected from {blockLabel || blockCategory || 'workspace'}
        </p>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 italic">
          "{highlightedText}"
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={18} className="text-text-muted animate-spin" />
          </div>
        ) : !hasResults ? (
          <div className="px-5 py-10 text-center">
            <Search size={28} className="text-border mx-auto mb-3" />
            <p className="text-sm text-text-secondary font-medium mb-1">No sources found</p>
            <p className="text-xs text-text-muted leading-relaxed">
              Try selecting a more specific phrase that appears in the research findings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Web sources */}
            {webSources.length > 0 && (
              <section className="px-5 py-4">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Globe size={10} /> Web Sources
                </p>
                <div className="space-y-3">
                  {webSources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl border border-border hover:border-brand/30 hover:bg-brand/[0.02] transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                            {s.title || s.publisher}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {s.publisher}{s.date ? ` · ${s.date}` : ''}
                          </p>
                        </div>
                        <ExternalLink size={12} className="text-text-muted group-hover:text-brand shrink-0 mt-0.5 transition-colors" />
                      </div>
                      {s.matching_quote && (
                        <blockquote className="mt-2 pl-2.5 border-l-2 border-brand/40">
                          <p className="text-xs text-text-primary italic leading-relaxed line-clamp-3">
                            "{s.matching_quote}"
                          </p>
                        </blockquote>
                      )}
                      {s.snippet && !s.matching_quote && (
                        <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-4">
                          {s.snippet}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Document sources */}
            {docSources.length > 0 && (
              <section className="px-5 py-4">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <FileText size={10} /> Documents
                </p>
                <div className="space-y-3">
                  {docSources.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border bg-gray-50">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-text-primary truncate">{d.filename}</p>
                        <span className="text-[10px] text-text-muted shrink-0 font-medium bg-white border border-border px-1.5 py-0.5 rounded">
                          p. {d.page_number}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-5">{d.excerpt}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
