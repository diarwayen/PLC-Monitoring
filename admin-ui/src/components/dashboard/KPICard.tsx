import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
}

export function KPICard({ title, value, subtitle, icon: Icon }: KPICardProps) {
  return (
    <div className="flex-1 bg-navy-light p-5 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <span className="text-3xl font-bold tracking-tight text-white">
            {value}
          </span>
          {subtitle && (
            <p className="text-xs text-white/60">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/15">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
