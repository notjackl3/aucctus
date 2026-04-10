import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, ArrowLeft, Loader2, Check, Sparkles,
} from 'lucide-react';
import { createAnalysis, listDocuments, getMarketSuggestions } from '../api/client';
import type { DocumentResponse } from '../api/client';
import CompanySetup from '../components/CompanySetup';
import { useCompany } from '../context/CompanyContext';

const FRAMING_SUGGESTIONS = [
  'Should we pursue this opportunity?',
  'What conditions would make this market attractive for us?',
  'What gives us a right to win here?',
  'What are the major risks or unknowns?',
];

type Step = 'market' | 'framing' | 'documents' | 'context' | 'review';
const STEPS: Step[] = ['market', 'framing', 'documents', 'context', 'review'];

// ── Static bubble positions (text filled from API) ───────────────────────────
const BUBBLE_POSITIONS: { top?: string; bottom?: string; left?: string; right?: string; dur: number; delay: number }[] = [
  { top: '9%',    left: '12%',  dur: 5.2, delay: 0     },
  { top: '15%',   right: '8%',  dur: 6.4, delay: 1.2  },
  { top: '44%',   left: '2%',   dur: 4.9, delay: 0.7  },
  { top: '50%',   right: '2%',  dur: 5.8, delay: 2.1  },
  { bottom: '26%', left: '9%',  dur: 6.1, delay: 1.4  },
  { bottom: '20%', right: '7%', dur: 5.3, delay: 0.3  },
  { bottom: '9%', left: '38%',  dur: 5.7, delay: 1.8  },
];

const BUBBLE_COUNT = BUBBLE_POSITIONS.length;

// ── Framing suggestion bubble positions ──────────────────────────────────────
const FRAMING_BUBBLE_POSITIONS: { top?: string; bottom?: string; left?: string; right?: string; dur: number; delay: number }[] = [
  { top: '12%',    left: '8%',   dur: 5.6, delay: 0.3  },
  { top: '18%',    right: '6%',  dur: 6.1, delay: 1.5  },
  { bottom: '22%', left: '6%',   dur: 5.3, delay: 0.8  },
  { bottom: '16%', right: '5%',  dur: 6.4, delay: 2.0  },
];

function sampleBubbles(pool: string[]): string[] {
  if (pool.length <= BUBBLE_COUNT) return pool;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, BUBBLE_COUNT);
}


export default function InputPage() {
  const navigate = useNavigate();
  const { activeCompany, loading: loadingCompanies, addCompany } = useCompany();
  const [showSetup, setShowSetup] = useState(false);

  const [step, setStep] = useState<Step>('market');
  const [marketSpace, setMarketSpace] = useState('');
  const [framingQuestion, setFramingQuestion] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bubbleTexts, setBubbleTexts] = useState<string[]>([]);

  useEffect(() => {
    if (!activeCompany) return;
    getMarketSuggestions(activeCompany.id)
      .then(({ suggestions }) => setBubbleTexts(sampleBubbles(suggestions)))
      .catch(() => {});
  }, [activeCompany?.id]);

  useEffect(() => {
    if (!activeCompany) return;
    setLoadingDocs(true);
    listDocuments(activeCompany.id)
      .then((docs) => {
        setDocuments(docs);
        setSelectedDocIds(new Set(docs.map((d) => d.id)));
      })
      .catch(() => setDocuments([]))
      .finally(() => setLoadingDocs(false));
  }, [activeCompany?.id]);

  useEffect(() => {
    if (!loadingCompanies && !activeCompany) setShowSetup(true);
  }, [loadingCompanies, activeCompany]);

  const effectiveSteps = documents.length > 0
    ? STEPS
    : STEPS.filter((s) => s !== 'documents');

  const effectiveIndex = effectiveSteps.indexOf(step);
  const canAdvance = step !== 'market' || marketSpace.trim().length > 0;

  const goNext = () => {
    const i = effectiveSteps.indexOf(step);
    if (i < effectiveSteps.length - 1) setStep(effectiveSteps[i + 1]);
  };
  const goBack = () => {
    const i = effectiveSteps.indexOf(step);
    if (i > 0) setStep(effectiveSteps[i - 1]);
  };

  const handleSubmit = async () => {
    if (!activeCompany || !marketSpace.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createAnalysis({
        companyName: activeCompany.name,
        marketSpace: marketSpace.trim(),
        companyId: activeCompany.id,
        framingQuestion: framingQuestion.trim() || undefined,
        companyContext: additionalContext.trim() || undefined,
      });
      navigate(`/analysis/${res.id}?op=${res.operationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (step === 'review') handleSubmit();
        else if (canAdvance) goNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, canAdvance, marketSpace, activeCompany, submitting, effectiveSteps]);

  const toggleDoc = (docId: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId); else next.add(docId);
      return next;
    });
  };
  const toggleAllDocs = () => {
    if (selectedDocIds.size === documents.length) setSelectedDocIds(new Set());
    else setSelectedDocIds(new Set(documents.map((d) => d.id)));
  };

  if (loadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0306]">
        <Loader2 size={24} className="text-white/40 animate-spin" />
      </div>
    );
  }

  if (showSetup || !activeCompany) {
    return <CompanySetup onComplete={(company) => { addCompany(company); setShowSetup(false); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0306]">

      {/* ── Rich atmospheric background blooms ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at -8% 38%, rgba(170,8,8,0.72) 0%, transparent 62%),' +
            'radial-gradient(ellipse 70% 55% at 108% -2%, rgba(160,8,90,0.58) 0%, transparent 60%),' +
            'radial-gradient(ellipse 55% 40% at 50% 18%, rgba(120,5,45,0.28) 0%, transparent 68%),' +
            'radial-gradient(ellipse 35% 28% at 72% 72%, rgba(140,5,70,0.18) 0%, transparent 55%)',
        }}
      />
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ── Floating market idea bubbles (market step only) ── */}
      {step === 'framing' && (
        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
          {FRAMING_SUGGESTIONS.map((q, i) => {
            const pos = FRAMING_BUBBLE_POSITIONS[i];
            if (!pos) return null;
            return (
              <button
                key={q}
                onClick={() => setFramingQuestion(q)}
                style={{
                  position: 'absolute',
                  animationName: 'gentleFloat',
                  animationDuration: `${pos.dur}s`,
                  animationDelay: `${pos.delay}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  top: pos.top,
                  bottom: pos.bottom,
                  left: pos.left,
                  right: pos.right,
                  pointerEvents: 'auto',
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.055] backdrop-blur-md text-white/45 text-xs font-medium hover:border-white/28 hover:text-white/80 hover:bg-white/[0.11] transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles size={11} className="text-red-400/55 shrink-0" />
                {q}
              </button>
            );
          })}
        </div>
      )}

      {step === 'market' && bubbleTexts.length > 0 && (
        <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
          {bubbleTexts.map((text, i) => {
            const pos = BUBBLE_POSITIONS[i];
            if (!pos) return null;
            return (
              <button
                key={i}
                onClick={() => setMarketSpace(text)}
                style={{
                  position: 'absolute',
                  animationName: 'gentleFloat',
                  animationDuration: `${pos.dur}s`,
                  animationDelay: `${pos.delay}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  top: pos.top,
                  bottom: pos.bottom,
                  left: pos.left,
                  right: pos.right,
                  pointerEvents: 'auto',
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.055] backdrop-blur-md text-white/45 text-xs font-medium hover:border-white/28 hover:text-white/80 hover:bg-white/[0.11] transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles size={11} className="text-red-400/55 shrink-0" />
                {text}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-2xl">

          {/* Step content */}
          <div>
            {step === 'market' && (
              <StepMarket
                value={marketSpace}
                onChange={setMarketSpace}
                companyName={activeCompany.name}
                onNext={goNext}
              />
            )}
            {step === 'framing' && (
              <StepFraming value={framingQuestion} onChange={setFramingQuestion} onNext={goNext} />
            )}
            {step === 'documents' && (
              <StepDocuments
                documents={documents}
                selectedIds={selectedDocIds}
                loading={loadingDocs}
                onToggle={toggleDoc}
                onToggleAll={toggleAllDocs}
                onNext={goNext}
              />
            )}
            {step === 'context' && (
              <StepContext value={additionalContext} onChange={setAdditionalContext} onNext={goNext} />
            )}
            {step === 'review' && (
              <StepReview
                companyName={activeCompany.name}
                marketSpace={marketSpace}
                framingQuestion={framingQuestion}
                additionalContext={additionalContext}
                documentCount={selectedDocIds.size}
                totalDocuments={documents.length}
                onEdit={setStep}
              />
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-red-400 mt-4">{error}</p>
          )}
        </div>
      </div>

      {/* ── Bottom navigation (pinned) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-8 pb-8 pointer-events-none">
        <button
          type="button"
          onClick={goBack}
          style={{ pointerEvents: 'auto' }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            effectiveIndex > 0
              ? 'text-white/50 hover:text-white'
              : 'invisible'
          }`}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {step === 'review' && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !marketSpace.trim()}
            style={{ pointerEvents: 'auto' }}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold transition-all ${
              !submitting && marketSpace.trim()
                ? 'bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-white/22 hover:border-white/40 shadow-lg shadow-black/20'
                : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <><Loader2 size={15} className="animate-spin" /> Starting...</>
            ) : (
              <><Search size={15} /> Run Assessment <ArrowRight size={14} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}


// ── Step 1: Market ────────────────────────────────────────────────────────────

function StepMarket({ value, onChange, companyName, onNext }: {
  value: string; onChange: (v: string) => void; companyName: string; onNext: () => void;
}) {
  return (
    <div className="text-center">
      {/* Glassy gradient title */}
      <h1
        className="mb-5 leading-[1.05] tracking-tight"
        style={{
          background: [
            'linear-gradient(158deg,',
            '  rgba(255,255,255,0.92)  0%,',
            '  rgba(188,205,245,0.68) 18%,',
            '  rgba(255,255,255,0.88) 34%,',
            '  rgba(168,188,235,0.60) 52%,',
            '  rgba(255,255,255,0.85) 66%,',
            '  rgba(192,210,248,0.65) 82%,',
            '  rgba(255,255,255,0.90) 100%',
            ')',
          ].join(''),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: [
            'drop-shadow(0 1px 10px rgba(180,200,255,0.28))',
            'drop-shadow(0 0 35px rgba(255,255,255,0.10))',
          ].join(' '),
          fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          textWrap: 'balance',
        }}
      >
        What market should {companyName} explore?
      </h1>

      <p className="text-sm text-white/40 mb-10">
        Enter a market, vertical, or adjacency to evaluate
      </p>

      {/* Pill-shaped input with arrow button */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. AI-Powered Expense Management, Cloud Security"
          className="w-full pl-7 pr-16 py-4 rounded-full border border-white/14 bg-white/[0.07] backdrop-blur-md text-white placeholder:text-white/28 focus:outline-none focus:border-white/30 focus:bg-white/[0.10] transition-all text-base text-center"
          autoFocus
        />
        <button
          type="button"
          onClick={() => { if (value.trim()) onNext(); }}
          disabled={!value.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            value.trim()
              ? 'bg-white/15 hover:bg-white/25 text-white cursor-pointer'
              : 'bg-white/5 text-white/20 cursor-default'
          }`}
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-[11px] text-white/22 mt-4">
        Press Enter to continue — or click a suggestion above
      </p>
    </div>
  );
}


// ── Shared gradient heading ───────────────────────────────────────────────────

function GradientHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="mb-5 leading-[1.05] tracking-tight"
      style={{
        background: [
          'linear-gradient(158deg,',
          '  rgba(255,255,255,0.92)  0%,',
          '  rgba(188,205,245,0.68) 18%,',
          '  rgba(255,255,255,0.88) 34%,',
          '  rgba(168,188,235,0.60) 52%,',
          '  rgba(255,255,255,0.85) 66%,',
          '  rgba(192,210,248,0.65) 82%,',
          '  rgba(255,255,255,0.90) 100%',
          ')',
        ].join(''),
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: [
          'drop-shadow(0 1px 10px rgba(180,200,255,0.28))',
          'drop-shadow(0 0 35px rgba(255,255,255,0.10))',
        ].join(' '),
        fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        textWrap: 'balance',
      }}
    >
      {children}
    </h1>
  );
}


// ── Step 2: Framing Question ──────────────────────────────────────────────────

function StepFraming({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="text-center">
      <GradientHeading>What question do you have?</GradientHeading>
      <p className="text-sm text-white/40 mb-10">This focuses the research on what matters most to you</p>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Should we pursue this? What gives us a right to win?"
          className="w-full pl-7 pr-16 py-4 rounded-full border border-white/14 bg-white/[0.07] backdrop-blur-md text-white placeholder:text-white/28 focus:outline-none focus:border-white/30 focus:bg-white/[0.10] transition-all text-base text-center"
          autoFocus
        />
        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/15 hover:bg-white/25 text-white cursor-pointer"
        >
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="text-[11px] text-white/22 mt-4">Optional — skip for a broad assessment, or click a suggestion</p>
    </div>
  );
}


// ── Step 3: Document Selection ────────────────────────────────────────────────

function StepDocuments({ documents, selectedIds, loading, onToggle, onToggleAll, onNext }: {
  documents: DocumentResponse[]; selectedIds: Set<string>; loading: boolean;
  onToggle: (id: string) => void; onToggleAll: () => void; onNext: () => void;
}) {
  return (
    <div className="text-center">
      <GradientHeading>Which documents should inform this?</GradientHeading>
      <p className="text-sm text-white/40 mb-8">Select company documents to include as context</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="text-white/40 animate-spin" />
        </div>
      ) : (
        <div className="text-left">
          <button
            type="button"
            onClick={onToggleAll}
            className="flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white transition-colors mb-3 px-1"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              selectedIds.size === documents.length ? 'bg-white/80 border-white/80' : 'border-white/25'
            }`}>
              {selectedIds.size === documents.length && <Check size={10} className="text-black" />}
            </div>
            {selectedIds.size === documents.length ? 'Deselect all' : 'Select all'}
          </button>
          <div className="space-y-2 max-h-[13.5rem] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {documents.map((doc) => {
              const selected = selectedIds.has(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => onToggle(doc.id)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    selected ? 'border-white/30 bg-white/15' : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                    selected ? 'bg-white/80 border-white/80' : 'border-white/25'
                  }`}>
                    {selected && <Check size={10} className="text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
                    {doc.summary && (
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">{doc.summary}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[11px] text-white/25">
              {selectedIds.size} of {documents.length} selected
            </p>
            <button
              type="button"
              onClick={onNext}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/15 hover:bg-white/25 text-white"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Step 4: Additional Context ────────────────────────────────────────────────

function StepContext({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="text-center">
      <GradientHeading>Any additional context?</GradientHeading>
      <p className="text-sm text-white/40 mb-8">Constraints, focus areas, or details specific to this run</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. North American market only. Sales team has flagged this as a growth area..."
        rows={4}
        className="w-full px-5 py-4 rounded-2xl border border-white/14 bg-white/[0.07] backdrop-blur-md text-white placeholder:text-white/28 focus:outline-none focus:border-white/30 focus:bg-white/[0.10] transition-all text-sm resize-none"
        autoFocus
      />
      <div className="flex justify-between items-center mt-3">
        <p className="text-[11px] text-white/22">Optional — your company profile is already applied</p>
        <button
          type="button"
          onClick={onNext}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/15 hover:bg-white/25 text-white shrink-0"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}


// ── Step 5: Review ────────────────────────────────────────────────────────────

function StepReview({ companyName, marketSpace, framingQuestion, additionalContext, documentCount, totalDocuments, onEdit }: {
  companyName: string; marketSpace: string; framingQuestion: string;
  additionalContext: string; documentCount: number; totalDocuments: number;
  onEdit: (step: Step) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <GradientHeading>Ready to run</GradientHeading>
        <p className="text-sm text-white/40">Review your assessment parameters</p>
      </div>
      <div className="space-y-2">
        <GlassRow label="Company" value={companyName} />
        <GlassRow label="Market" value={marketSpace} onEdit={() => onEdit('market')} />
        <GlassRow label="Framing Question" value={framingQuestion || '—'} muted={!framingQuestion} onEdit={() => onEdit('framing')} />
        {totalDocuments > 0 && (
          <GlassRow label="Documents" value={`${documentCount} of ${totalDocuments} included`} muted={documentCount === 0} onEdit={() => onEdit('documents')} />
        )}
        <GlassRow label="Additional Context" value={additionalContext || '—'} muted={!additionalContext} onEdit={() => onEdit('context')} />
      </div>
    </div>
  );
}


function GlassRow({ label, value, muted, onEdit }: {
  label: string; value: string; muted?: boolean; onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/[0.08] backdrop-blur-sm group">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wide mb-0.5">{label}</p>
        <p className={`text-sm leading-relaxed ${muted ? 'text-white/25 italic' : 'text-white/80'}`}>{value}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-white/30 hover:text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3 mt-1"
        >
          Edit
        </button>
      )}
    </div>
  );
}
