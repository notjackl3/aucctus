import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, ArrowLeft, Loader2, Check,
} from 'lucide-react';
import { createAnalysis, listDocuments } from '../api/client';
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

const glassInput =
  'w-full px-5 py-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-all text-base text-center';

const glassTextarea =
  'w-full px-5 py-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/40 focus:bg-white/[0.13] transition-all text-sm resize-none';

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

  // Load documents when company changes
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

  // Show setup if no company after loading
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={24} className="text-white/40 animate-spin" />
      </div>
    );
  }

  if (showSetup || !activeCompany) {
    return <CompanySetup onComplete={(company) => { addCompany(company); setShowSetup(false); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background blooms */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 25% -5%, rgba(220,38,38,0.35) 0%, transparent 70%),' +
            'radial-gradient(ellipse 45% 30% at 78% -8%, rgba(236,72,153,0.22) 0%, transparent 65%),' +
            'radial-gradient(ellipse 30% 20% at 55% 2%, rgba(251,113,133,0.12) 0%, transparent 60%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-lg">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-14">
            {effectiveSteps.map((s, i) => (
              <button
                key={s}
                onClick={() => { if (i <= effectiveIndex) setStep(s); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-white'
                    : i < effectiveIndex
                    ? 'w-1.5 bg-white/40 cursor-pointer'
                    : 'w-1.5 bg-white/15 cursor-default'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="min-h-[300px]">
            {step === 'market' && (
              <StepMarket value={marketSpace} onChange={setMarketSpace} companyName={activeCompany.name} onNext={goNext} />
            )}
            {step === 'framing' && (
              <StepFraming value={framingQuestion} onChange={setFramingQuestion} />
            )}
            {step === 'documents' && (
              <StepDocuments documents={documents} selectedIds={selectedDocIds} loading={loadingDocs} onToggle={toggleDoc} onToggleAll={toggleAllDocs} />
            )}
            {step === 'context' && (
              <StepContext value={additionalContext} onChange={setAdditionalContext} />
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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              type="button"
              onClick={goBack}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                effectiveIndex > 0
                  ? 'text-white/50 hover:text-white hover:bg-white/10'
                  : 'invisible'
              }`}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {step === 'review' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !marketSpace.trim()}
                className={`flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  !submitting && marketSpace.trim()
                    ? 'bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-white/10'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Starting...</>
                ) : (
                  <><Search size={15} /> Run Assessment <ArrowRight size={14} /></>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                className={`flex items-center gap-1.5 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  canAdvance
                    ? 'bg-white text-gray-900 hover:bg-white/90'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {step === 'market' ? 'Continue' : 'Next'}
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Step 1: Market ──

function StepMarket({ value, onChange, companyName, onNext }: {
  value: string; onChange: (v: string) => void; companyName: string; onNext: () => void;
}) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
        What market should {companyName} explore?
      </h1>
      <p className="text-sm text-white/45 mb-10">Enter a market, vertical, or adjacency to evaluate</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. AI-Powered Expense Management, Cloud Security"
        className={glassInput}
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { e.preventDefault(); onNext(); } }}
      />
      <p className="text-[11px] text-white/25 mt-3">Press Enter to continue</p>
    </div>
  );
}


// ── Step 2: Framing Question ──

function StepFraming({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
        What question are you trying to answer?
      </h1>
      <p className="text-sm text-white/45 mb-10">This focuses the research on what matters most to you</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Should we pursue this? What gives us a right to win?"
        className={glassInput}
        autoFocus
      />
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {FRAMING_SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onChange(q)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              value === q
                ? 'border-white/40 bg-white/20 text-white'
                : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white/60'
            }`}
          >
            {q}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-white/25 mt-5">Optional — skip for a broad assessment</p>
    </div>
  );
}


// ── Step 3: Document Selection ──

function StepDocuments({ documents, selectedIds, loading, onToggle, onToggleAll }: {
  documents: DocumentResponse[]; selectedIds: Set<string>; loading: boolean;
  onToggle: (id: string) => void; onToggleAll: () => void;
}) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
        Which documents should inform this?
      </h1>
      <p className="text-sm text-white/45 mb-8">Select company documents to include as context</p>

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
          <div className="space-y-2">
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
                    <p className="text-[10px] text-white/35 mt-0.5">{doc.chunkCount} chunks</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-white/25 mt-4 text-center">
            {selectedIds.size} of {documents.length} selected
          </p>
        </div>
      )}
    </div>
  );
}


// ── Step 4: Additional Context ──

function StepContext({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
        Any additional context?
      </h1>
      <p className="text-sm text-white/45 mb-8">Constraints, focus areas, or details specific to this run</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. North American market only. Sales team has flagged this as a growth area..."
        rows={4}
        className={glassTextarea}
        autoFocus
      />
      <p className="text-[11px] text-white/25 mt-3">Optional — your company profile is already applied</p>
    </div>
  );
}


// ── Step 5: Review ──

function StepReview({ companyName, marketSpace, framingQuestion, additionalContext, documentCount, totalDocuments, onEdit }: {
  companyName: string; marketSpace: string; framingQuestion: string;
  additionalContext: string; documentCount: number; totalDocuments: number;
  onEdit: (step: Step) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ready to run</h1>
        <p className="text-sm text-white/45">Review your assessment parameters</p>
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
