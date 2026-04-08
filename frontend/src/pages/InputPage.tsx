import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Target, FileText, Loader2, Building2,
  ChevronDown, HelpCircle, Settings,
} from 'lucide-react';
import { createAnalysis, listCompanies } from '../api/client';
import type { CompanyResponse } from '../api/client';
import CompanySetup from '../components/CompanySetup';

const ACTIVE_COMPANY_KEY = 'aucctus_active_company_id';

const FRAMING_SUGGESTIONS = [
  'Should we pursue this opportunity?',
  'What conditions would make this market attractive for us?',
  'What gives us a right to win here?',
  'What are the major risks or unknowns?',
];

export default function InputPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [activeCompany, setActiveCompany] = useState<CompanyResponse | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  const [marketSpace, setMarketSpace] = useState('');
  const [framingQuestion, setFramingQuestion] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load companies on mount
  useEffect(() => {
    listCompanies()
      .then((list) => {
        setCompanies(list);
        const savedId = localStorage.getItem(ACTIVE_COMPANY_KEY);
        const active = list.find((c) => c.id === savedId) || list[0] || null;
        if (active) {
          setActiveCompany(active);
          localStorage.setItem(ACTIVE_COMPANY_KEY, active.id);
        } else {
          setShowSetup(true);
        }
      })
      .catch(() => setShowSetup(true))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const handleCompanyCreated = (company: CompanyResponse) => {
    setCompanies((prev) => [...prev, company]);
    setActiveCompany(company);
    localStorage.setItem(ACTIVE_COMPANY_KEY, company.id);
    setShowSetup(false);
  };

  const canSubmit = activeCompany && marketSpace.trim() && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !activeCompany) return;
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

  if (loadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="text-brand animate-spin" />
      </div>
    );
  }

  if (showSetup || !activeCompany) {
    return <CompanySetup onComplete={handleCompanyCreated} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-start justify-center px-8 pt-12 pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
          {/* Company profile header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
                <Building2 size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{activeCompany.name}</p>
                <p className="text-xs text-text-muted">
                  {activeCompany.context
                    ? `Profile: ${activeCompany.context.slice(0, 60)}${activeCompany.context.length > 60 ? '...' : ''}`
                    : 'No strategic context set'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
              title="Edit company profile"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">New Opportunity Assessment</h1>
            <p className="text-sm text-text-secondary mt-1.5">
              What market or opportunity should {activeCompany.name} evaluate?
            </p>
          </div>

          {/* Market / Opportunity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <Target size={16} className="text-text-muted" />
              Market / Opportunity
            </label>
            <input
              type="text"
              value={marketSpace}
              onChange={(e) => setMarketSpace(e.target.value)}
              placeholder="e.g. AI-Powered Expense Management, Developer Analytics, Cloud Security"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm"
              autoFocus
            />
          </div>

          {/* Framing Question */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <HelpCircle size={16} className="text-text-muted" />
              Framing Question
              <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={framingQuestion}
              onChange={(e) => setFramingQuestion(e.target.value)}
              placeholder="e.g. Should we pursue this? What gives us a right to win?"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {FRAMING_SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setFramingQuestion(q)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    framingQuestion === q
                      ? 'border-brand/40 bg-brand/10 text-brand'
                      : 'border-border text-text-muted hover:border-brand/20 hover:text-text-secondary'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced: additional context */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <ChevronDown size={12} className={`transition-transform ${showAdvanced ? '' : '-rotate-90'}`} />
              Additional context for this assessment
            </button>
            {showAdvanced && (
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any run-specific context, constraints, or focus areas beyond the company profile..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm resize-none mt-2"
              />
            )}
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
                : 'bg-gray-100 text-text-muted cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Starting Assessment...
              </>
            ) : (
              <>
                <Search size={16} />
                Run Assessment
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-gray-50 border border-border rounded-xl p-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary">How it works:</strong> AI research agents assess
              incumbents, emerging competitors, and market sizing — then synthesize a strategic
              recommendation with conditions for pursuit, risks, and questions requiring your judgment.
              Your company profile is automatically used to evaluate strategic fit.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
