import { useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText, Globe, Loader2, X } from 'lucide-react';
import { lookupSources } from '../api/client';
import type { DocSource, WebSource } from '../api/client';

interface Props {
  workspaceId: string;
  highlightedText: string;
  insightId?: string;
  blockCategory?: string;
  anchorRect: DOMRect;
  onClose: () => void;
}

export default function SourcePopup({ workspaceId, highlightedText, insightId, blockCategory, anchorRect, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const [docSources, setDocSources] = useState<DocSource[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lookupSources(workspaceId, highlightedText, insightId, blockCategory)
      .then(({ web_sources, doc_sources }) => {
        setWebSources(web_sources);
        setDocSources(doc_sources);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId, highlightedText, insightId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Position: below the selection, clamp to viewport
  const style = (() => {
    const popupW = 380;
    const margin = 12;
    let left = anchorRect.left + anchorRect.width / 2 - popupW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - popupW - margin));
    const top = anchorRect.bottom + 8 + window.scrollY;
    return { top, left, width: popupW };
  })();

  const hasResults = webSources.length > 0 || docSources.length > 0;

  return (
    <div
      ref={ref}
      className="fixed z-[100] rounded-2xl border border-white/10 bg-[#0e0a10]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Sources</p>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Highlighted quote */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[11px] text-white/35 italic line-clamp-2">"{highlightedText}"</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="text-white/30 animate-spin" />
        </div>
      ) : !hasResults ? (
        <div className="px-4 pb-5 pt-2 text-center">
          <p className="text-xs text-white/35">No sources found for this selection.</p>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Web sources */}
          {webSources.length > 0 && (
            <section className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Globe size={10} /> Web
              </p>
              <div className="space-y-2">
                {webSources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl border border-white/8 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/16 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/85 truncate">{s.title || s.publisher}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{s.publisher}{s.date ? ` · ${s.date}` : ''}</p>
                      </div>
                      <ExternalLink size={11} className="text-white/20 group-hover:text-white/50 shrink-0 mt-0.5 transition-colors" />
                    </div>
                    {s.snippet && (
                      <p className="text-[11px] text-white/50 mt-2 line-clamp-3 leading-relaxed">{s.snippet}</p>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Document sources */}
          {docSources.length > 0 && (
            <section className="px-4 pt-3 pb-4">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <FileText size={10} /> Documents
              </p>
              <div className="space-y-2">
                {docSources.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-white/8 bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-white/85 truncate">{d.filename}</p>
                      <span className="text-[10px] text-white/35 shrink-0 font-medium">p. {d.page_number}</span>
                    </div>
                    <p className="text-[11px] text-white/50 line-clamp-4 leading-relaxed">{d.excerpt}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
