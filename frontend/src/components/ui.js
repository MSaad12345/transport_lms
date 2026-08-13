'use client';

import { STATUS_COLORS } from '@/lib/constants';
import clsx from 'clsx';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Kpi({ label, value, delta, up }) {
  return (
    <div className="kpi">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {delta != null && (
          <span className={clsx('text-xs font-semibold', up ? 'text-emerald-600' : 'text-rose-600')}>
            {up ? '▲' : '▼'} {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function Panel({ title, right, children, className }) {
  return (
    <div className={clsx('card', className)}>
      {(title || right) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          {title && <h3 className="font-bold">{title}</h3>}
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={clsx('badge badge-dot', STATUS_COLORS[status] || STATUS_COLORS.Draft)}>
      {status}
    </span>
  );
}

export function Badge({ children, color = 'slate' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    red: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    blue: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    violet: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  };
  return <span className={clsx('badge', map[color] || map.slate)}>{children}</span>;
}

export function Empty({ children = 'No data found.' }) {
  return (
    <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">{children}</div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

export function Progress({ value, color = 'bg-sky-500' }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div className={clsx('h-full rounded-full', color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function BarChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <div
            className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-sky-600 to-sky-400"
            style={{ height: `${(d.v / max) * 100}%`, minHeight: 4 }}
            title={`${d.label}: ${d.v}`}
          />
          <div className="truncate text-[10px] text-slate-500">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className={clsx(
          'max-h-[90dvh] w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900',
          wide ? 'max-w-3xl' : 'max-w-lg'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h3 className="font-bold">{title}</h3>
          <button className="btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Avatar({ name }) {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
      {(name || '?')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()}
    </div>
  );
}
