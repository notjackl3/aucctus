import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import StatusCard from '../components/StatusCard';
import { getOperation, getAnalysis } from '../api/client';
import type { ResearchStepStatus } from '../types/analysis';

const defaultSteps: ResearchStepStatus[] = [
  { step: 'incumbents', label: 'Incumbents', status: 'pending' },
  { step: 'emerging_competitors', label: 'Emerging Competitors', status: 'pending' },
  { step: 'market_sizing', label: 'Market Sizing', status: 'pending' },
  { step: 'synthesis', label: 'Opportunity Assessment', status: 'pending' },
];

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { id: analysisId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const operationId = searchParams.get('op');

  const [steps, setSteps] = useState<ResearchStepStatus[]>(defaultSteps);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Fetch analysis info for the subtitle
  useEffect(() => {
    if (!analysisId) return;
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
  }, [analysisId, navigate]);

  // Poll operation status
  useEffect(() => {
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
  }, [operationId, analysisId, navigate]);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-start justify-center px-8 pt-16 pb-12">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Loader2 size={22} className="text-brand animate-spin" />
              <h1 className="text-2xl font-bold text-text-primary">Analysis in Progress</h1>
            </div>
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">
                {completedCount} of {steps.length} research steps complete
              </span>
              <span className="text-xs text-text-muted">{elapsedSeconds}s elapsed</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step cards */}
          <div className="space-y-3">
            {steps.map((step) => (
              <StatusCard key={step.step} step={step} />
            ))}
          </div>

          {/* Info text */}
          <p className="text-xs text-text-muted text-center leading-relaxed">
            AI agents are researching across multiple data sources. This typically takes 30-60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
