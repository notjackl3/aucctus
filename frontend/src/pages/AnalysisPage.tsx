import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getOperation, getAnalysis } from '../api/client';
import type { ResearchStepStatus } from '../types/analysis';

const defaultSteps: ResearchStepStatus[] = [
  { step: 'incumbents', label: 'Incumbents', status: 'pending' },
  { step: 'emerging_competitors', label: 'Emerging Competitors', status: 'pending' },
  { step: 'market_sizing', label: 'Market Sizing', status: 'pending' },
  { step: 'synthesis', label: 'Opportunity Assessment', status: 'pending' },
];

// ── Skeleton primitives ──

function SkeletonLine({ w = 'w-full', h = 'h-3', className = '' }: { w?: string; h?: string; className?: string }) {
  return <div className={`skeleton-shimmer rounded-full ${w} ${h} ${className}`} />;
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

function isStepDone(steps: ResearchStepStatus[], stepIndex: number) {
  return steps[stepIndex]?.status === 'completed';
}

function isStepRunning(steps: ResearchStepStatus[], stepIndex: number) {
  return steps[stepIndex]?.status === 'running';
}

// ── Left sidebar cards ──

function SkeletonScoreCard({ done }: { done: boolean }) {
  return (
    <div className={`w-full p-5 rounded-xl border mb-4 transition-colors duration-500 ${done ? 'bg-go-light border-go/20' : 'bg-white border-border'}`}>
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Strategic Score</span>
      {done ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <CheckCircle2 size={32} className="text-go" />
          <span className="text-xs text-go font-medium">Assessment ready</span>
        </div>
      ) : (
        <>
          <div className="flex justify-center my-4">
            <SkeletonBlock className="w-24 h-24 !rounded-full" />
          </div>
          <div className="space-y-2 mt-2">
            <SkeletonLine w="w-4/5" />
            <SkeletonLine w="w-3/5" />
            <SkeletonLine w="w-2/5" h="h-2.5" className="mt-3" />
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonResearchCard({ label, done, running }: { label: string; done: boolean; running: boolean }) {
  return (
    <div className={`w-full p-4 rounded-xl border mb-1 transition-colors duration-500 ${done ? 'bg-go-light border-go/20' : 'bg-white border-border'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        {done ? (
          <CheckCircle2 size={14} className="text-go shrink-0" />
        ) : running ? (
          <span className="text-[10px] text-brand font-medium animate-pulse">Researching…</span>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <SkeletonLine w="w-full" className={done ? 'opacity-30' : ''} />
        <SkeletonLine w="w-3/4" className={done ? 'opacity-30' : ''} />
      </div>
    </div>
  );
}

// ── Right panel skeleton ──

function SkeletonRightPanel({ synthesisDone }: { synthesisDone: boolean }) {
  const cardClass = (done: boolean) =>
    `rounded-2xl border p-6 transition-colors duration-500 ${done ? 'bg-go-light border-go/20' : 'bg-white border-border'}`;

  return (
    <div className="flex-1 min-w-0 space-y-4">

      {/* Strategic Assessment — full width */}
      <div className={cardClass(synthesisDone)}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-text-primary">Strategic Assessment</span>
          {synthesisDone && <CheckCircle2 size={16} className="text-go" />}
        </div>
        {synthesisDone ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle2 size={28} className="text-go" />
            <span className="text-sm text-go font-medium">Loading results…</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <SkeletonLine w="w-full" />
            <SkeletonLine w="w-11/12" />
            <SkeletonLine w="w-full" />
            <SkeletonLine w="w-5/6" />
            <SkeletonLine w="w-full" />
            <SkeletonLine w="w-4/5" />
            <SkeletonLine w="w-full" />
            <SkeletonLine w="w-3/4" />
          </div>
        )}
      </div>

      {/* Reasons to Believe + Reasons to Challenge — side by side */}
      <div className="flex gap-4">
        <div className={`flex-1 ${cardClass(synthesisDone)}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-text-primary">Reasons to Believe</span>
            {synthesisDone && <CheckCircle2 size={14} className="text-go" />}
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-2.5">
                <SkeletonBlock className="w-4 h-4 !rounded-full shrink-0 mt-0.5" />
                <SkeletonLine w="w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className={`flex-1 ${cardClass(synthesisDone)}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-text-primary">Reasons to Challenge</span>
            {synthesisDone && <CheckCircle2 size={14} className="text-go" />}
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2.5">
                <SkeletonBlock className="w-4 h-4 !rounded-full shrink-0 mt-0.5" />
                <SkeletonLine w="w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Questions — full width */}
      <div className={cardClass(synthesisDone)}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-text-primary">Decision Questions</span>
          {synthesisDone && <CheckCircle2 size={16} className="text-go" />}
        </div>
        {!synthesisDone && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <SkeletonBlock className="flex-1 h-9 !rounded-xl" />
              <SkeletonBlock className="flex-1 h-9 !rounded-xl" />
            </div>
            <div className="space-y-2 pt-1">
              <SkeletonLine w="w-full" h="h-4" />
              <SkeletonLine w="w-5/6" h="h-3" />
              <SkeletonLine w="w-4/6" h="h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ──

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { id: analysisId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const operationId = searchParams.get('op');
  const isPreview = searchParams.get('preview') === 'true';

  const [steps, setSteps] = useState<ResearchStepStatus[]>(defaultSteps);
  const [error, setError] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Preview mode — simulate step progression without any API calls
  useEffect(() => {
    if (!isPreview) return;
    setSubtitle('Acme Corp — Enterprise Cybersecurity');
    let current = 0;
    const tick = setInterval(() => {
      current += 1;
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i < current - 1) return { ...s, status: 'completed' };
          if (i === current - 1) return { ...s, status: 'running' };
          return { ...s, status: 'pending' };
        })
      );
      if (current > defaultSteps.length) clearInterval(tick);
    }, 2500);
    return () => clearInterval(tick);
  }, [isPreview]);

  // Fetch analysis info for the subtitle
  useEffect(() => {
    if (isPreview || !analysisId) return;
    getAnalysis(analysisId)
      .then((data) => {
        setSubtitle(`${data.request.companyName} — ${data.request.marketSpace}`);
        if (data.status === 'completed') {
          setSteps(data.steps);
          setTimeout(() => navigate(`/workspace/${analysisId}`), 500);
        } else if (data.steps?.length) {
          setSteps(data.steps);
        }
      })
      .catch(() => {/* polling will handle errors */});
  }, [analysisId, navigate, isPreview]);

  // Poll operation status
  useEffect(() => {
    if (isPreview) return;
    if (!operationId || !analysisId) {
      setError('Missing operation or analysis ID');
      return;
    }

    const poll = async () => {
      try {
        const op = await getOperation(operationId);

        if (op.progress) {
          const { stepsCompleted } = op.progress;
          setSteps((prev) =>
            prev.map((s, i) => {
              if (i < stepsCompleted) return { ...s, status: 'completed' };
              if (i === stepsCompleted && op.status === 'running') return { ...s, status: 'running' };
              return { ...s, status: 'pending' };
            })
          );
        }

        if (op.status === 'completed' || op.status === 'completed_with_warnings') {
          clearInterval(pollRef.current);
          try {
            const analysis = await getAnalysis(analysisId);
            if (analysis.steps?.length) setSteps(analysis.steps);
          } catch { /* navigate anyway */ }
          setTimeout(() => navigate(`/workspace/${analysisId}`), 800);
        } else if (op.status === 'error') {
          clearInterval(pollRef.current);
          setError(op.errorMessage || 'Analysis failed');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 1500);

    return () => clearInterval(pollRef.current);
  }, [operationId, analysisId, navigate, isPreview]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-start justify-center px-8 pt-16 pb-12">
          <div className="w-full max-w-lg space-y-6 text-center">
            <AlertCircle size={40} className="text-nogo mx-auto" />
            <h1 className="text-xl font-bold text-text-primary">Analysis Failed</h1>
            <p className="text-sm text-text-secondary">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const incumbentsDone = isStepDone(steps, 0);
  const emergingDone = isStepDone(steps, 1);
  const marketDone = isStepDone(steps, 2);
  const synthesisDone = isStepDone(steps, 3);

  const incumbentsRunning = isStepRunning(steps, 0);
  const emergingRunning = isStepRunning(steps, 1);
  const marketRunning = isStepRunning(steps, 2);
  const synthesisRunning = isStepRunning(steps, 3);

  const [companyName, marketSpace] = subtitle.split(' — ');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              {subtitle ? (
                <>
                  <h1 className="text-2xl font-bold text-text-primary">{companyName}</h1>
                  <p className="text-sm text-text-secondary">{marketSpace}</p>
                </>
              ) : (
                <div className="space-y-1.5">
                  <SkeletonLine w="w-48" h="h-6" />
                  <SkeletonLine w="w-32" h="h-3" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-medium text-text-secondary">Analyzing…</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-8 pb-8">
        <div className="flex gap-6">
          {/* Left column */}
          <div className="w-80 shrink-0">
            <SkeletonScoreCard done={synthesisDone} />

            <div className="pt-1 pb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Research Foundation</span>
            </div>
            <SkeletonResearchCard label="Incumbents" done={incumbentsDone} running={incumbentsRunning} />
            <SkeletonResearchCard label="Emerging Competitors" done={emergingDone} running={emergingRunning} />
            <SkeletonResearchCard label="Market Sizing" done={marketDone} running={marketRunning} />

            <div className="pt-4 pb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Synthesis & Evidence</span>
            </div>
            <SkeletonResearchCard label="Risks & Open Questions" done={synthesisDone} running={synthesisRunning} />
          </div>

          {/* Right column */}
          <SkeletonRightPanel synthesisDone={synthesisDone} />
        </div>
      </div>
    </div>
  );
}
