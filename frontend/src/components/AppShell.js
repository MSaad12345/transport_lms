'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  Users,
  MapPin,
  Radio,
  Wallet,
  BarChart3,
  Contact,
  Sparkles,
  Bell,
  Shield,
  Menu,
  LogOut,
  Moon,
  Sun,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS, ROLES, initials } from '@/lib/constants';
import api from '@/lib/api';
import { Loading } from './ui';
import clsx from 'clsx';

const ICONS = {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  Users,
  MapPin,
  Radio,
  Wallet,
  BarChart3,
  Contact,
  Sparkles,
  Bell,
  Shield,
};

export default function AppShell({ children }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [unread, setUnread] = useState(0);
  const [q, setQ] = useState('');

  useEffect(() => {
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('lms_theme');
    const isDark = saved ? saved === 'dark' : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    api
      .unreadCount()
      .then((r) => setUnread(r.data?.count || 0))
      .catch(() => {});
  }, [user, pathname]);

  const nav = useMemo(() => {
    if (!user) return [];
    return NAV_ITEMS.filter(
      (n) => n.roles === '*' || n.roles.includes(user.role)
    );
  }, [user]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('lms_theme', next ? 'dark' : 'light');
  }

  if (loading || !user) return <Loading label="Loading workspace…" />;

  const NavList = ({ onNavigate }) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
      {nav.map((item) => {
        const Icon = ICONS[item.icon] || LayoutDashboard;
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx('sidebar-link', active && 'active')}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 text-slate-100 md:flex">
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold leading-none">LMS</div>
            <div className="mt-0.5 text-[10px] text-slate-400">Logistics Suite</div>
          </div>
        </div>
        <NavList />
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user.name}</div>
              <div className="truncate text-[11px] text-slate-400">{ROLES[user.role]}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[min(280px,86vw)] flex-col bg-slate-950 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2 font-bold">
                <Truck className="h-5 w-5 text-sky-400" /> LMS
              </div>
              <button className="btn-ghost btn-sm text-slate-300" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-3 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-5">
          <button className="btn-ghost btn-sm md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-4 w-4" />
          </button>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search orders, drivers, customers…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && q.trim()) {
                  router.push(`/orders?q=${encodeURIComponent(q.trim())}`);
                }
              }}
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/notifications" className="btn-ghost btn-sm relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </Link>
            <button className="btn-ghost btn-sm" onClick={toggleTheme} title="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="ml-1 hidden items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-700 sm:flex">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                {initials(user.name)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold leading-none">{user.name.split(' ')[0]}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">{user.role}</div>
              </div>
            </div>
            <button className="btn-ghost btn-sm" onClick={logout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
