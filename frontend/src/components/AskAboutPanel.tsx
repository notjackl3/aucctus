import { useState, Fragment } from 'react';
import { X, Loader2, MessageCircleQuestion } from 'lucide-react';
import { askAboutSelection } from '../api/client';

/** Render a string with **bold** spans into JSX. */
function renderFormatted(text: string) {
  // Split into paragraphs on double newline
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs.map((para, pi) => {
    // Split on **bold** markers
    const parts = para.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={pi} className="text-sm text-text-secondary leading-relaxed mb-3 last:mb-0">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-semibold text-text-primary">{part}</strong>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          )
        )}
      </p>
    );
  });
}

interface Props {
  analysisId: string;
  selectedText: string;
  blockCategory: string;
  blockLabel: string;
  onClose: () => void;
}

export default function AskAboutPanel({ analysisId, selectedText, blockCategory, blockLabel, onClose }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askAboutSelection(analysisId, {
        selectedText,
        question: question.trim(),
        blockCategory,
        blockLabel,
      });
      setAnswer(res.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-50 bg-white border-l border-border shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Ask About Selection</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} className="text-text-muted" />
        </button>
      </div>

      {/* Selected text context */}
      <div className="px-5 py-3 border-b border-border bg-gray-50">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">
          Selected from {blockLabel || blockCategory}
        </p>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
          "{selectedText}"
        </p>
      </div>

      {/* Question input */}
      <div className="px-5 py-4 border-b border-border">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to know about this?"
          className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAsk();
            }
          }}
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || loading}
          className="mt-2 w-full py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Thinking...
            </span>
          ) : (
            'Ask'
          )}
        </button>
      </div>

      {/* Answer area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        {answer && (
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Answer</p>
            {renderFormatted(answer)}
          </div>
        )}
        {!answer && !error && !loading && (
          <p className="text-xs text-text-muted text-center mt-8">
            Ask a question about the selected text to get a contextual answer based on the research data.
          </p>
        )}
      </div>
    </div>
  );
}
