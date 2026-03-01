import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/children', label: 'Children', icon: '👶' },
  { to: '/daily', label: 'Daily', icon: '📅' },
  { to: '/notes', label: 'Notes', icon: '💬' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function AppLayout() {
  const { profile } = useAuth();
  const items = navItems;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-warm-100 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-warm-700">The Gran Plan</h1>
          <p className="text-warm-500 mt-1">{profile?.displayName}</p>
          <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-warm-100 text-warm-600 capitalize">
            {profile?.role}
          </span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-colors',
                  isActive
                    ? 'bg-warm-100 text-warm-700'
                    : 'text-warm-500 hover:bg-warm-50 hover:text-warm-600',
                )
              }
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-24 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[64px] transition-colors',
                  isActive
                    ? 'text-warm-600 bg-warm-50'
                    : 'text-warm-400 hover:text-warm-500',
                )
              }
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
