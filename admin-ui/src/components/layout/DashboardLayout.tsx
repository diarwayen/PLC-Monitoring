import { useState, ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');

  return (
    <div className="min-h-screen flex w-full bg-surface">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeRoute={activeRoute}
        onRouteChange={setActiveRoute}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
