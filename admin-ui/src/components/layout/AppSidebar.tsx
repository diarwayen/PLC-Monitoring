import { LayoutDashboard, Settings, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function AppSidebar({ collapsed, onToggle, activeRoute, onRouteChange }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <h1 className="text-base font-semibold text-sidebar-foreground animate-fade-in">Dashboard</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onRouteChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              activeRoute === item.id
                ? 'bg-sidebar-accent text-navy font-medium'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5 flex-shrink-0', activeRoute === item.id && 'text-navy')} />
            {!collapsed && (
              <span className="text-sm animate-fade-in">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Daralt</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
