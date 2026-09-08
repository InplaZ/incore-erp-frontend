import { type ReactNode } from 'react';
import { cn } from '@/utils';

interface TabsProps {
  tabs: { key: string; label: string; icon?: ReactNode; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-slate-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            active === tab.key
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-xs font-semibold',
              active === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500',
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
