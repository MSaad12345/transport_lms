'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/constants';
import clsx from 'clsx';

export default function LoginPage() {
  const { login, isAuthenticated, loading, showToast } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@lms.io');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [selected, setSelected] = useState('admin');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/dashboard');
  }, [loading, isAuthenticated, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-950 via-sky-950 to-sky-800 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.28),transparent_40%)]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold">LMS</div>
            <div className="text-xs text-sky-200/80">Logistics Management System</div>
          </div>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Move everything, everywhere — intelligently.
          </h1>
          <p className="mt-4 leading-relaxed text-sky-100/80">
            Cloud-native SaaS for orders, warehouses, fleet, drivers, live GPS, payments and
            AI-powered route optimization.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ['100K+', 'Deliveries / day'],
              ['99.9%', 'Platform uptime'],
              ['30%', 'Lower delivery cost'],
              ['<300ms', 'API response'],
            ].map(([a, b]) => (
              <div key={b} className="rounded-xl border border-white/10 bg-white/10 p-3">
                <div className="text-xl font-bold">{a}</div>
                <div className="text-xs text-sky-100/70">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-sky-200/60">
          Multi-tenant • RBAC • Real-time • AI-powered
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="card w-full max-w-md p-6 shadow-lg">
          <div className="mb-5 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500 text-white">
              <Truck className="h-4 w-4" />
            </div>
            <div className="font-bold">LMS</div>
          </div>
          <h2 className="text-xl font-bold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use a demo role or your own credentials.
          </p>

          <div className="mt-5">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-3">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold text-slate-500">Demo roles</div>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  type="button"
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition',
                    selected === a.role
                      ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  )}
                  onClick={() => {
                    setSelected(a.role);
                    setEmail(a.email);
                    setPassword(DEMO_PASSWORD);
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary mt-5 w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">
            Password for all demos: <code className="font-mono">{DEMO_PASSWORD}</code>
          </p>
        </form>
      </div>
    </div>
  );
}
