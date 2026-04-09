import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, Settings, ChevronUp, Check } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

const navItems = [
  { icon: Home, path: '/', label: 'Home' },
  { icon: BarChart3, path: '/history', label: 'History' },
  { icon: Settings, path: '/settings', label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { companies, activeCompany, setActiveCompany } = useCompany();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-border flex flex-col items-center py-5 z-30">
        {/* Logo */}
        <Link to="/" className="mb-8">
          <img src="/aucctus.png" alt="Aucctus" className="w-10 h-10 rounded-lg object-contain" />
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map(({ icon: Icon, path, label }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-brand/10 text-brand shadow-sm'
                    : 'text-text-muted hover:bg-gray-100 hover:text-text-primary'
                }`}
              >
                <Icon size={22} />
              </Link>
            );
          })}
        </nav>

        {/* Company selector */}
        {activeCompany && (
          <div ref={pickerRef} className="relative mt-auto w-full flex flex-col items-center">
            {/* Popover */}
            {pickerOpen && companies.length > 0 && (
              <div className="absolute bottom-full mb-2 left-2 right-2 rounded-xl border border-border bg-white shadow-xl overflow-hidden">
                <div className="p-2 space-y-0.5">
                  {companies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveCompany(c); setPickerOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        c.id === activeCompany.id
                          ? 'bg-brand/8 text-brand'
                          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        c.id === activeCompany.id ? 'bg-brand/15 text-brand' : 'bg-gray-100 text-text-muted'
                      }`}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium truncate flex-1">{c.name}</span>
                      {c.id === activeCompany.id && <Check size={10} className="shrink-0 text-brand" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Company avatar button */}
            <button
              onClick={() => setPickerOpen((v) => !v)}
              title={activeCompany.name}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all mb-1 relative group ${
                pickerOpen ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                pickerOpen ? 'bg-brand/15 text-brand' : 'bg-gray-100 text-text-secondary group-hover:bg-gray-200'
              }`}>
                {activeCompany.name.charAt(0).toUpperCase()}
              </div>
              {companies.length > 1 && (
                <ChevronUp
                  size={8}
                  className={`absolute bottom-1 right-1 text-text-muted transition-transform ${pickerOpen ? '' : 'rotate-180'}`}
                />
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-20 overflow-y-auto min-h-screen">{children}</main>
    </div>
  );
}
