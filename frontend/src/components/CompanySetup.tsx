import { useState } from 'react';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { createCompany } from '../api/client';
import type { CompanyResponse } from '../api/client';

interface Props {
  onComplete: (company: CompanyResponse) => void;
}

export default function CompanySetup({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const company = await createCompany(name.trim(), context.trim() || undefined);
      onComplete(company);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company profile');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-start justify-center px-8 pt-16 pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-white">Set Up Your Company Profile</h1>
            <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
              Define your company once, then run opportunity assessments against it.
              You can update this anytime in Settings.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Strategic Context
              <span className="text-text-muted font-normal ml-1">(recommended)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe your company's core business, strategic priorities, key strengths, target markets, and any constraints or focus areas..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all text-sm resize-none"
            />
            <p className="text-xs text-text-muted mt-1.5">
              This context is used to assess strategic fit, right to win, and conditions for pursuit across all your assessments.
            </p>
          </div>

          {error && (
            <div className="bg-nogo-light border border-nogo/20 rounded-xl px-4 py-3 text-sm text-nogo">
              {error}
            </div>
          )}

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
                Creating Profile...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
