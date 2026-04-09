import { useState, useEffect, useRef } from 'react';
import {
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
  Shield,
  Target,
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  Compass,
  Layers,
  Trash2,
} from 'lucide-react';
import {
  listCompanies,
  createCompany,
  updateCompanyContext,
  getStrategy,
  buildStrategy,
  listDocuments,
  uploadDocument,
  deleteDocument,
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
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
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

  const handleDeleteDocument = async (docId: string) => {
    setDeletingDocId(docId);
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      // silently fail — item stays in list
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompanyId) return;
    setUploading(true);
    try {
      await uploadDocument(selectedCompanyId, file);
      const docs = await listDocuments(selectedCompanyId);
      setDocuments(docs);
    } catch {
      // silently fail
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
        <h1 className="text-xl font-bold text-text-primary">Failed to Load</h1>
        <p className="text-sm text-text-secondary">{error}</p>
      </div>
    );
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // Compute readiness indicators
  const hasContext = !!(selectedCompany?.context?.trim());
  const hasLens = !!lens;
  const hasDocs = documents.length > 0;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-4xl mx-auto px-8 pt-10 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Company Profile</h1>
            <p className="text-sm text-text-secondary">
              Configure how your corporate strategies, company documents, and relevant information.
            </p>
          </div>
        </div>

        {/* Readiness indicator */}
        {selectedCompany && (
          <div className="flex items-center gap-2 mb-8 mt-4">
            <ReadinessStep label="Profile" done={hasContext} step={1} />
            <div className="w-6 h-px bg-border" />
            <ReadinessStep label="Strategy Lens" done={hasLens} step={2} />
            <div className="w-6 h-px bg-border" />
            <ReadinessStep label="Documents" done={hasDocs} step={3} optional />
          </div>
        )}

        <div className="space-y-6">
          {/* ═══ Section 1: Company Profile ═══ */}
          <section className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-brand" />
                <h2 className="text-base font-semibold text-text-primary">Basic Information</h2>
              </div>
              <button
                onClick={() => setShowNewCompanyForm(!showNewCompanyForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
              >
                <Plus size={14} />
                New Company
              </button>
            </div>
            <p className="text-xs text-text-muted mb-5">
              Your company's strategic position, priorities, and competitive advantages.
            </p>

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
                      Strategic Context
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
                    placeholder="Describe your company's strategic position, target customers, competitive advantages, and key constraints. This context is used to evaluate strategic fit for every opportunity assessment."
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
                      Import from File
                    </button>
                    <span className="text-xs text-text-muted">
                      {extractedFilename ? (
                        <span className="text-go flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Imported from {extractedFilename}
                        </span>
                      ) : (
                        'Extract text from a PDF, TXT, or DOC and append it to the context above.'
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-end mt-3">
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
                  Create a company profile to start evaluating opportunities.
                </p>
              </div>
            )}
          </section>

          {/* ═══ Section 2: Strategy Lens ═══ */}
          {selectedCompanyId && (
            <section className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-1">
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
              <p className="text-xs text-text-muted mb-5">
                A structured view of your strategic priorities, ICP, GTM strengths, and constraints.
              </p>

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
                <div className="text-center py-10 border border-dashed border-border rounded-xl">
                  <Brain size={28} className="text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-text-primary mb-1">
                    {companyContext.trim()
                      ? 'Ready to generate your strategy lens'
                      : 'Add company context first'}
                  </p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    {companyContext.trim()
                      ? 'The lens extracts strategic priorities, ICP, GTM strengths, constraints, and fit signals from your context. It shapes how every opportunity is evaluated.'
                      : 'Write or import your company context above — then build a strategy lens from it.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ═══ Section 3: Supporting Documents ═══ */}
          {selectedCompanyId && (
            <section className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-brand" />
                  <h2 className="text-base font-semibold text-text-primary">Supporting Documents</h2>
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
                    Upload
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-muted mb-5">
                Upload strategy briefs, pitch decks, or market research. Documents are embedded and used to enrich the strategy lens and analysis context.
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
                      className={`flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-border transition-opacity ${
                        deletingDocId === doc.id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {doc.filename}
                        </p>
                        {doc.summary && (
                          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                            {doc.summary}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                        className="p-2 rounded-lg text-text-muted hover:text-nogo hover:bg-nogo/10 transition-colors disabled:opacity-50 shrink-0"
                        title="Delete document"
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-xl">
                  <FileText size={28} className="text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-medium text-text-primary mb-1">No documents yet</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Upload company documents to enrich your strategy lens and give analyses deeper context. Optional — the profile context above is sufficient to start.
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


// ── Readiness step indicator ──

function ReadinessStep({ label, done, step, optional }: {
  label: string;
  done: boolean;
  step: number;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
        done
          ? 'bg-go text-white'
          : 'bg-gray-100 text-text-muted'
      }`}>
        {done ? <CheckCircle2 size={12} /> : step}
      </div>
      <span className={`text-xs font-medium ${done ? 'text-text-primary' : 'text-text-muted'}`}>
        {label}
        {optional && !done && <span className="text-text-muted font-normal ml-1">(optional)</span>}
      </span>
    </div>
  );
}


// ── Strategy Lens Viewer ──

const LENS_SECTIONS = [
  { key: 'strategicPriorities', label: 'Strategic Priorities', icon: Target },
  { key: 'productAdjacencies', label: 'Product Adjacencies', icon: Compass },
  { key: 'targetCustomers', label: 'Ideal Customer Profile', icon: Users },
  { key: 'gtmStrengths', label: 'GTM Strengths', icon: TrendingUp },
  { key: 'constraints', label: 'Constraints', icon: AlertTriangle },
  { key: 'geographicFocus', label: 'Geographic Focus', icon: MapPin },
  { key: 'riskPosture', label: 'Risk Posture', icon: Shield },
  { key: 'internalFitSignals', label: 'Fit Signals', icon: CheckCircle2 },
  { key: 'internalMisfitSignals', label: 'Misfit Signals', icon: AlertCircle },
] as const;

function flattenLensValue(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        // strategicPriorities: {priority, importance, supportingEvidence}
        if ('priority' in obj) {
          const tag = obj.importance ? ` [${obj.importance}]` : '';
          return [`${obj.priority}${tag}`];
        }
        // constraints: {constraint, severity, source}
        if ('constraint' in obj) {
          const tag = obj.severity ? ` [${obj.severity}]` : '';
          return [`${obj.constraint}${tag}`];
        }
        // Fallback: join non-empty string values
        return [Object.values(obj).filter((v) => typeof v === 'string' && v).join(' — ')];
      }
      return [String(item)];
    });
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    // riskPosture: {level, reasoning, implications}
    if ('level' in obj && 'reasoning' in obj) {
      const lines = [`${obj.level}: ${obj.reasoning}`];
      if (Array.isArray(obj.implications)) {
        lines.push(...obj.implications.map(String));
      }
      return lines;
    }
    // targetCustomers: {segments, painPoints, buyingCriteria, antiPatterns}
    const items: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.length > 0) {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
        items.push(`${label}: ${v.join(', ')}`);
      } else if (typeof v === 'string' && v) {
        items.push(v);
      }
    }
    return items;
  }
  return [String(value)];
}

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
      </div>

      {/* Lens sections — 2 column grid for density */}
      <div className="grid grid-cols-2 gap-3">
        {LENS_SECTIONS.map(({ key, label, icon: Icon }) => {
          const items = flattenLensValue(lens[key]);
          if (items.length === 0) return null;

          return (
            <div key={key} className="p-3.5 rounded-xl bg-gray-50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} className="text-brand" />
                <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                  {label}
                </h4>
              </div>
              {items.length === 1 ? (
                <p className="text-xs text-text-secondary leading-relaxed">{items[0]}</p>
              ) : (
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-brand mt-1.5 shrink-0" />
                      <span className="text-xs text-text-secondary leading-relaxed">{item}</span>
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
