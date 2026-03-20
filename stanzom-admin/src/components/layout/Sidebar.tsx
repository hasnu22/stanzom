import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Target,
  Users,
  Shield,
  MessageSquare,
  Star,
  Gift,
  Coins,
  Bell,
  UserCircle,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
  requiredRole?: 'SUPER_ADMIN';
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Sports', path: '/sports', icon: Trophy },
      { label: 'Events', path: '/events', icon: Calendar },
      { label: 'Predictions', path: '/predictions', icon: Target },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { label: 'Players', path: '/players', icon: Users },
      { label: 'Teams', path: '/teams', icon: Shield },
      { label: 'Pundit', path: '/pundit', icon: MessageSquare },
      { label: 'Influencers', path: '/influencers', icon: Star },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Prizes', path: '/prizes', icon: Gift },
      { label: 'Rewards', path: '/rewards', icon: Coins },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Users', path: '/users', icon: UserCircle },
    ],
  },
  {
    title: 'ADMIN',
    requiredRole: 'SUPER_ADMIN',
    items: [
      { label: 'Admin Management', path: '/admins', icon: ShieldCheck },
    ],
  },
];

export function Sidebar() {
  const collapsed = useSidebar((s) => s.collapsed);
  const toggle = useSidebar((s) => s.toggle);
  const setCollapsed = useSidebar((s) => s.setCollapsed);

  const admin = useAuth((s) => s.admin);
  const isSuperAdmin = useAuth((s) => s.isSuperAdmin);
  const logout = useAuth((s) => s.logout);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          'max-lg:translate-x-0',
          collapsed && 'max-lg:-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <span className="text-xl font-bold text-gold tracking-wide">
              Stanzom
            </span>
          )}
          <button
            onClick={toggle}
            className="rounded-md p-1.5 text-muted hover:text-text transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6">
          {NAV_SECTIONS.map((section) => {
            if (section.requiredRole && !isSuperAdmin) {
              return null;
            }

            return (
              <div key={section.title}>
                {!collapsed && (
                  <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                            'hover:bg-white/5 hover:text-text',
                            isActive
                              ? 'text-gold border-l-2 border-gold bg-gold/5'
                              : 'text-muted border-l-2 border-transparent',
                            collapsed && 'justify-center px-0'
                          )
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon size={20} className="shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer - Admin info */}
        <div className="border-t border-border p-4">
          {collapsed ? (
            <button
              onClick={() => void logout()}
              className="flex w-full justify-center rounded-md p-1.5 text-muted hover:text-red transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
                  {admin?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() ?? 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {admin?.name ?? 'Admin'}
                  </p>
                  <span className="inline-block rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                    {admin?.role ?? 'ADMIN'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-red/10 hover:text-red transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
