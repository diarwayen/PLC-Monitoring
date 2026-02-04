import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
        status === 'online'
          ? 'bg-success/10 text-success'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'online' ? 'bg-success animate-pulse' : 'bg-muted-foreground'
        )}
      />
      {status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
    </span>
  );
}
