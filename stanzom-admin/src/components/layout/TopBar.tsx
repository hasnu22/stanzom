import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const PATH_LABELS: Record<string, string> = {
  '': 'Dashboard',
  sports: 'Sports',
  events: 'Events',
  predictions: 'Predictions',
  players: 'Players',
  teams: 'Teams',
  pundit: 'Pundit',
  influencers: 'Influencers',
  prizes: 'Prizes',
  rewards: 'Rewards',
  notifications: 'Notifications',
  users: 'Users',
  'admin-management': 'Admin Management',
};

export function TopBar() {
  const location = useLocation();
  const admin = useAuth((s) => s.admin);
  const logout = useAuth((s) => s.logout);

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Dashboard', path: '/' }];

    return segments.map((seg, i) => ({
      label: PATH_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      path: '/' + segments.slice(0, i + 1).join('/'),
    }));
  }, [location.pathname]);

  const initials = admin?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'A';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted">Home</span>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-muted/60" />
            <span
              className={cn(
                i === breadcrumbs.length - 1
                  ? 'font-medium text-text'
                  : 'text-muted'
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative rounded-md p-2 text-muted hover:bg-white/5 hover:text-text transition-colors">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red" />
        </button>

        {/* Admin dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-white/5 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
                {initials}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem className="gap-2 text-muted hover:text-text cursor-pointer">
              <User size={16} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-muted hover:text-red cursor-pointer"
              onClick={() => void logout()}
            >
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
