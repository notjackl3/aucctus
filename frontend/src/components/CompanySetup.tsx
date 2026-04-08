import { useState, useRef } from 'react';
import { Building2, ArrowRight, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { createCompany, extractTextFromFile } from '../api/client';
import type { CompanyResponse } from '../api/client';

interface Props {
  onComplete: (company: CompanyResponse) => void;
}

export default function CompanySetup({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedFilename, setExtractedFilename] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setExtractedFilename(null);
    try {
      const { text, filename } = await extractTextFromFile(file);
      if (text.trim()) {
        const separator = context.trim() ? '\n\n---\n\n' : '';
        setContext((prev) => prev + separator + text.trim());
        setExtractedFilename(filename);
        setTimeout(() => setExtractedFilename(null), 3000);
      }
    } catch {
      // extraction failed silently
    } finally {
      setExtracting(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="flex-1 flex items-start justify-center px-8 pt-16 pb-12">
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Set Up Your Company Profile</h1>
            <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
              Define your company once, then run opportunity assessments against it.
              You can update this anytime in Settings.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-all text-sm backdrop-blur-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Strategic Context
              <span className="text-white/50 font-normal ml-1">(recommended)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe your company's core business, strategic priorities, key strengths, target markets, and any constraints or focus areas..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-all text-sm resize-none backdrop-blur-sm"
            />
            {/* PDF import */}
            <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-white/5 border border-dashed border-white/20">
              <input
                type="file"
                ref={pdfInputRef}
                onChange={handleImportPdf}
                className="hidden"
                accept=".pdf,.txt,.md,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={extracting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {extracting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Import from PDF
              </button>
              <span className="text-xs text-white/50">
                {extractedFilename ? (
                  <span className="text-go flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Imported text from {extractedFilename}
                  </span>
                ) : (
                  'Upload a PDF or doc to populate context automatically.'
                )}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1.5">
              This context is used to assess strategic fit, right to win, and conditions for pursuit across all your assessments.
            </p>
          </div>

          {error && (
            <div className="bg-nogo/20 border border-nogo/30 rounded-xl px-4 py-3 text-sm text-nogo">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              canSubmit
                ? 'bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow-md cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
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
