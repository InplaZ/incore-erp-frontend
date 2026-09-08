import { type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className="animate-spin h-8 w-8 text-brand-500 mb-3" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'No fue posible cargar la información.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-14 w-14 rounded-full bg-danger-50 flex items-center justify-center text-danger-500 mb-4">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0L3.3 16A2 2 0 005 19z" />
        </svg>
      </div>
      <p className="text-sm text-slate-600 max-w-sm text-center">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-7 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-10 w-10 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="h-4 w-4 bg-slate-200 rounded" />
      <div className="h-4 w-24 bg-slate-200 rounded" />
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
      <div className="h-4 w-16 bg-slate-200 rounded" />
      <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
    </div>
  );
}
