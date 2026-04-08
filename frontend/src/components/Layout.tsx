import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Settings, LogOut, User } from 'lucide-react';

const navItems = [
  { icon: Home, path: '/', label: 'Home' },
  { icon: BarChart3, path: '/history', label: 'History' },
  { icon: Settings, path: '/settings', label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-20 bg-surface border-r border-border flex flex-col items-center py-5 shrink-0">
        {/* Logo */}
        <Link to="/" className="mb-8">
          <img src="/aucctus.png" alt="Aucctus" className="w-10 h-10 rounded-lg object-contain" />
        </Link>

        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map(({ icon: Icon, path, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={label}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-brand/10 text-brand shadow-sm'
                    : 'text-text-muted hover:bg-white/10 hover:text-text-primary'
                }`}
              >
                <Icon size={22} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-2 mt-auto">
          <button
            title="Sign out"
            className="w-12 h-12 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-text-primary transition-all"
          >
            <LogOut size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors" title="Profile">
            <User size={18} className="text-text-muted" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
