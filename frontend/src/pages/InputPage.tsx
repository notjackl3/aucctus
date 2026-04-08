import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Building2, Target, FileText, Loader2 } from 'lucide-react';
import { createAnalysis } from '../api/client';

export default function InputPage() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [marketSpace, setMarketSpace] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = companyName.trim() && marketSpace.trim() && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createAnalysis(companyName.trim(), marketSpace.trim(), companyContext.trim() || undefined);
      navigate(`/analysis/${res.id}?op=${res.operationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-8 pt-16 pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Strategic Opportunity Assessment</h1>
            <p className="text-sm text-text-secondary mt-2">
              Should your company pursue this opportunity? Assess market reality, competitive position, strategic fit, and conditions for success.
            </p>
          </div>
          {/* Company Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <Building2 size={16} className="text-text-muted" />
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Salesforce, Shopify"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm"
            />
          </div>

          {/* Market Space */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <Target size={16} className="text-text-muted" />
              Product / Market Space
            </label>
            <input
              type="text"
              value={marketSpace}
              onChange={(e) => setMarketSpace(e.target.value)}
              placeholder="e.g. AI-Powered Expense Management, Developer Analytics"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm"
            />
          </div>

          {/* Company Context */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <FileText size={16} className="text-text-muted" />
              Company Context
              <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
              placeholder="Describe the company's strengths, strategic priorities, existing assets, or constraints that should inform the assessment..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm resize-none"
            />
            <p className="text-xs text-text-muted mt-1.5">
              Helps assess strategic fit, right to win, and conditions for pursuit.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-nogo-light border border-nogo/20 rounded-xl px-4 py-3 text-sm text-nogo">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              canSubmit
                ? 'bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow-md cursor-pointer'
                : 'bg-white/10 text-text-muted cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Starting Analysis...
              </>
            ) : (
              <>
                <Search size={16} />
                Run Analysis
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-white/5 border border-border rounded-xl p-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary">How it works:</strong> AI research agents assess
              three dimensions — established incumbents, emerging competitors and funding, and
              market sizing — then synthesize findings into a strategic recommendation with
              conditions for pursuit, risks, and questions requiring your judgment.
            </p>
            <div className="flex gap-6 mt-3">
              {['Incumbents', 'Emerging Competitors', 'Market Sizing', 'Strategic Assessment'].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
                  <span className="text-xs text-text-muted">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
