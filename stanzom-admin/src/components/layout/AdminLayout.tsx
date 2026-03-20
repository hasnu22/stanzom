import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const collapsed = useSidebar((s) => s.collapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
