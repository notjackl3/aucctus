import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building2,
  Brain,
  FileText,
  Plus,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Upload,
  RefreshCw,
  Info,
  Shield,
  Target,
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import {
  listCompanies,
  createCompany,
  updateCompanyContext,
  getStrategy,
  buildStrategy,
  listDocuments,
  uploadDocument,
  extractTextFromFile,
} from '../api/client';
import type { CompanyResponse, DocumentResponse, StrategyLens } from '../api/client';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const ACTIVE_COMPANY_KEY = 'aucctus_active_company_id';

export default function SettingsPage() {
  // Company state
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Company form
  const [companyName, setCompanyName] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [contextSaveStatus, setContextSaveStatus] = useState<SaveStatus>('idle');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creating, setCreating] = useState(false);

  // Strategy lens
  const [lens, setLens] = useState<StrategyLens | null>(null);
  const [lensLoading, setLensLoading] = useState(false);
  const [lensBuilding, setLensBuilding] = useState(false);
  const [lensError, setLensError] = useState<string | null>(null);

  // PDF context import
  const [extracting, setExtracting] = useState(false);
  const [extractedFilename, setExtractedFilename] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Documents
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load companies on mount
  useEffect(() => {
    listCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) {
          const savedId = localStorage.getItem(ACTIVE_COMPANY_KEY);
          const active = data.find((c) => c.id === savedId) || data[0];
          setSelectedCompanyId(active.id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  // When selected company changes, load its data
  useEffect(() => {
    if (!selectedCompanyId) return;
    const company = companies.find((c) => c.id === selectedCompanyId);
    if (company) {
      setCompanyName(company.name);
      setCompanyContext(company.context || '');
    }
    setContextSaveStatus('idle');

    // Load strategy lens
    setLensLoading(true);
    setLensError(null);
    getStrategy(selectedCompanyId)
      .then(setLens)
      .catch(() => setLens(null))
      .finally(() => setLensLoading(false));

    // Load documents
    setDocsLoading(true);
    listDocuments(selectedCompanyId)
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, [selectedCompanyId, companies]);

  const handleSaveContext = async () => {
    if (!selectedCompanyId) return;
    setContextSaveStatus('saving');
    try {
      await updateCompanyContext(selectedCompanyId, companyContext);
      setContextSaveStatus('saved');
      // Update local state
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === selectedCompanyId ? { ...c, context: companyContext } : c,
        ),
      );
      setTimeout(() => setContextSaveStatus('idle'), 2000);
    } catch {
      setContextSaveStatus('error');
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return;
    setCreating(true);
    try {
      const company = await createCompany(newCompanyName.trim());
      setCompanies((prev) => [company, ...prev]);
      setSelectedCompanyId(company.id);
      localStorage.setItem(ACTIVE_COMPANY_KEY, company.id);
      setNewCompanyName('');
      setShowNewCompanyForm(false);
    } catch {
      // stay on form
    } finally {
      setCreating(false);
    }
  };

  const handleBuildLens = async () => {
    if (!selectedCompanyId) return;
    setLensBuilding(true);
    setLensError(null);
    try {
      const built = await buildStrategy(selectedCompanyId);
      setLens(built);
    } catch (err) {
      setLensError(err instanceof Error ? err.message : 'Failed to build strategy lens');
    } finally {
      setLensBuilding(false);
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
        const separator = companyContext.trim() ? '\n\n---\n\n' : '';
        setCompanyContext((prev) => prev + separator + text.trim());
        setExtractedFilename(filename);
        setContextSaveStatus('idle');
        setTimeout(() => setExtractedFilename(null), 3000);
      }
    } catch {
      // extraction failed silently
    } finally {
      setExtracting(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompanyId) return;
    setUploading(true);
    try {
      await uploadDocument(selectedCompanyId, file);
      // Refresh documents list
      const docs = await listDocuments(selectedCompanyId);
      setDocuments(docs);
    } catch {
      // silently fail — the document list will just not update
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-brand animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={40} className="text-nogo" />
        <h1 className="text-xl font-bold text-text-primary">Failed to Load Settings</h1>
        <p className="text-sm text-text-secondary">{error}</p>
      </div>
    );
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-4xl mx-auto px-8 pt-10 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Settings size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary">
              Company context, strategy lens, and evaluation configuration
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ═══ Section A: Company Profile ═══ */}
          <section className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-brand" />
                <h2 className="text-base font-semibold text-text-primary">Company Profile</h2>
              </div>
              <button
                onClick={() => setShowNewCompanyForm(!showNewCompanyForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
              >
                <Plus size={14} />
                New Company
              </button>
            </div>

            {/* New company form */}
            {showNewCompanyForm && (
              <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-border">
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Company Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCompany()}
                  />
                  <button
                    onClick={handleCreateCompany}
                    disabled={creating || !newCompanyName.trim()}
                    className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Create
                  </button>
                </div>
              </div>
            )}

            {/* Company selector */}
            {companies.length > 0 ? (
              <>
                <div className="mb-5">
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Active Company
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCompanyId || ''}
                      onChange={(e) => {
                        setSelectedCompanyId(e.target.value);
                        localStorage.setItem(ACTIVE_COMPANY_KEY, e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 cursor-pointer transition-all"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                    />
                  </div>
                </div>

                {selectedCompany && (
                  <div className="flex items-center gap-4 mb-5 text-xs text-text-muted">
                    <span>
                      Created{' '}
                      {new Date(selectedCompany.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {selectedCompany.updatedAt && (
                      <span>
                        Last updated{' '}
                        {new Date(selectedCompany.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}

                {/* Company Context */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-text-secondary">
                      Company Context & Strategy Notes
                    </label>
                    <div className="flex items-center gap-2">
                      {contextSaveStatus === 'saved' && (
                        <span className="flex items-center gap-1 text-xs text-go">
                          <CheckCircle2 size={12} />
                          Saved
                        </span>
                      )}
                      {contextSaveStatus === 'error' && (
                        <span className="flex items-center gap-1 text-xs text-nogo">
                          <AlertCircle size={12} />
                          Failed to save
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={companyContext}
                    onChange={(e) => {
                      setCompanyContext(e.target.value);
                      setContextSaveStatus('idle');
                    }}
                    rows={6}
                    placeholder="Describe your company's strategic position, priorities, target customers, competitive advantages, constraints, and anything else that should inform how opportunities are evaluated..."
                    className="w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all resize-y"
                  />
                  {/* PDF import */}
                  <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-gray-50 border border-dashed border-border">
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handleImportPdf}
                      className="hidden"
                      accept=".pdf,.txt,.md,.doc,.docx"
                    />
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={extracting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {extracting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      Import from PDF
                    </button>
                    <span className="text-xs text-text-muted">
                      {extractedFilename ? (
                        <span className="text-go flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Imported text from {extractedFilename}
                        </span>
                      ) : (
                        'Upload a PDF, TXT, or DOC to extract and append its text to the context above.'
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-text-muted flex items-center gap-1.5">
                      <Info size={12} />
                      This context shapes the strategy lens and how analyses evaluate fit for your company.
                    </p>
                    <button
                      onClick={handleSaveContext}
                      disabled={
                        contextSaveStatus === 'saving' ||
                        companyContext === (selectedCompany?.context || '')
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {contextSaveStatus === 'saving' ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      Save Context
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Building2 size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-1">No company profiles yet</p>
                <p className="text-xs text-text-muted">
                  Create a company profile to configure your evaluation context.
                </p>
              </div>
            )}
          </section>

          {/* ═══ Section B: Strategy Lens ═══ */}
          {selectedCompanyId && (
            <section className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Brain size={16} className="text-brand" />
                  <h2 className="text-base font-semibold text-text-primary">Strategy Lens</h2>
                </div>
                <button
                  onClick={handleBuildLens}
                  disabled={lensBuilding || !companyContext.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {lensBuilding ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {lens ? 'Rebuild Lens' : 'Build Lens'}
                </button>
              </div>

              {lensError && (
                <div className="mb-4 p-3 rounded-xl bg-nogo/10 border border-nogo/20 text-xs text-nogo flex items-center gap-2">
                  <AlertCircle size={14} />
                  {lensError}
                </div>
              )}

              {lensLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="text-brand animate-spin" />
                </div>
              ) : lens ? (
                <StrategyLensView lens={lens} />
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                  <Brain size={32} className="text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary mb-1">No strategy lens built yet</p>
                  <p className="text-xs text-text-muted">
                    {companyContext.trim()
                      ? 'Click "Build Lens" to generate a strategy lens from your company context.'
                      : 'Add company context above first, then build a strategy lens.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ═══ Section C: Data & Uploads ═══ */}
          {selectedCompanyId && (
            <section className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-brand" />
                  <h2 className="text-base font-semibold text-text-primary">Data & Documents</h2>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadFile}
                    className="hidden"
                    accept=".txt,.pdf,.md,.csv,.json,.doc,.docx"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    Upload Document
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
                <Info size={12} />
                Documents are chunked, embedded, and used to enrich the strategy lens and analysis context.
              </p>

              {docsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="text-brand animate-spin" />
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-border"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {doc.filename}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-text-muted">
                            {doc.chunkCount} chunks
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(doc.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {doc.summary && (
                          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                            {doc.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                  <FileText size={32} className="text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary mb-1">No documents uploaded</p>
                  <p className="text-xs text-text-muted">
                    Upload company docs (pitch decks, strategy briefs, market research) to enrich
                    analyses.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Strategy Lens Viewer ──

const LENS_SECTIONS = [
  { key: 'strategic_priorities', label: 'Strategic Priorities', icon: Target },
  { key: 'product_adjacencies', label: 'Product Adjacencies', icon: Compass },
  { key: 'icp', label: 'Ideal Customer Profile', icon: Users },
  { key: 'gtm_strengths', label: 'GTM Strengths', icon: TrendingUp },
  { key: 'constraints', label: 'Constraints', icon: AlertTriangle },
  { key: 'geographic_focus', label: 'Geographic Focus', icon: MapPin },
  { key: 'risk_posture', label: 'Risk Posture', icon: Shield },
  { key: 'fit_signals', label: 'Fit Signals', icon: CheckCircle2 },
  { key: 'misfit_signals', label: 'Misfit Signals', icon: AlertCircle },
] as const;

function StrategyLensView({ lens }: { lens: StrategyLens }) {
  return (
    <div className="space-y-4">
      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-text-muted pb-3 border-b border-border">
        <span>Version {lens.version}</span>
        {lens.builtAt && (
          <span>
            Built{' '}
            {new Date(lens.builtAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
        {lens.confidenceNote && <span>{lens.confidenceNote}</span>}
      </div>

      {/* Lens sections */}
      <div className="grid grid-cols-1 gap-3">
        {LENS_SECTIONS.map(({ key, label, icon: Icon }) => {
          const value = lens[key];
          if (!value) return null;

          const items = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? [value]
              : typeof value === 'object'
                ? Object.entries(value as Record<string, unknown>).map(
                    ([k, v]) => `${k}: ${v}`,
                  )
                : [String(value)];

          if (items.length === 0) return null;

          return (
            <div key={key} className="p-3.5 rounded-xl bg-gray-50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-brand" />
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  {label}
                </h4>
              </div>
              {items.length === 1 ? (
                <p className="text-sm text-text-secondary">{items[0]}</p>
              ) : (
                <ul className="space-y-1">
                  {(items as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-brand mt-2 shrink-0" />
                      <span className="text-sm text-text-secondary">{String(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
