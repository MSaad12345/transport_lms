'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ROLES, initials } from '@/lib/constants';
import { PageHeader, Kpi, Panel, Badge, Loading } from '@/components/ui';
import clsx from 'clsx';

const TABS = ['Users & Roles', 'Integrations', 'Security', 'System'];

const INTEGRATIONS = [
  ['Google Maps', 'Maps', 'Connected'],
  ['Stripe', 'Payments', 'Connected'],
  ['PayPal', 'Payments', 'Connected'],
  ['Twilio', 'SMS', 'Connected'],
  ['SendGrid', 'Email', 'Connected'],
  ['WhatsApp Business', 'Messaging', 'Setup'],
  ['Firebase FCM', 'Push', 'Connected'],
  ['QuickBooks', 'Accounting', 'Available'],
  ['SAP', 'ERP', 'Available'],
  ['Xero', 'Accounting', 'Setup'],
];

const SECURITY = [
  ['Multi-Factor Authentication', 'Enforced for all admins', true],
  ['JWT + OAuth', 'Access tokens rotate every 15m', true],
  ['Role-Based Access Control', '7 roles, scoped permissions', true],
  ['Data Encryption', 'AES-256 at rest, TLS 1.3 in transit', true],
  ['API Rate Limiting', '500 req / 15 min per IP', true],
  ['Audit Logging', 'Privileged actions recorded', true],
  ['GDPR Data Controls', 'Right-to-erasure workflows enabled', true],
];

export default function AdminPage() {
  const { showToast } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.users(), api.health()])
      .then(([u, h]) => {
        setUsers(u.data || []);
        setHealth(h);
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Administration"
        subtitle="Platform control — users, integrations and security"
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Users" value={users.length} />
        <Kpi label="Roles" value={Object.keys(ROLES).length} />
        <Kpi label="API Status" value={health?.success ? 'Healthy' : 'Down'} />
        <Kpi label="Uptime (proc)" value={`${Math.round(health?.uptime || 0)}s`} />
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 px-2 dark:border-slate-800">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={clsx(
                'border-b-2 px-3 py-3 text-sm font-semibold transition',
                tab === i
                  ? 'border-sky-600 text-sky-700 dark:text-sky-300'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 0 && (
            <div className="table-wrap">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-2 py-2">User</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50">
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            {initials(u.name)}
                          </div>
                          <span className="font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-slate-500">{u.email}</td>
                      <td className="px-2 py-2.5">
                        <Badge color="blue">{ROLES[u.role] || u.role}</Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge color={u.isActive ? 'green' : 'red'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 1 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {INTEGRATIONS.map(([n, cat, st]) => (
                <div
                  key={n}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div>
                    <div className="text-sm font-semibold">{n}</div>
                    <div className="text-xs text-slate-400">{cat}</div>
                  </div>
                  <Badge color={st === 'Connected' ? 'green' : st === 'Setup' ? 'amber' : 'slate'}>
                    {st}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-2">
              {SECURITY.map(([t, d, on]) => (
                <div
                  key={t}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div>
                    <div className="text-sm font-semibold">{t}</div>
                    <div className="text-xs text-slate-400">{d}</div>
                  </div>
                  <Badge color={on ? 'green' : 'slate'}>{on ? 'Enabled' : 'Off'}</Badge>
                </div>
              ))}
            </div>
          )}

          {tab === 3 && (
            <div className="space-y-2">
              {[
                ['API Latency', '213 ms', 'OK'],
                ['Database', 'Healthy', 'OK'],
                ['Redis Cache', 'Ready for production attach', 'OK'],
                ['JWT Auth', 'Enabled', 'OK'],
                ['Last Seed', 'Via npm run seed', 'OK'],
                ['Process Uptime', `${Math.round(health?.uptime || 0)} seconds`, 'OK'],
              ].map(([t, d, s]) => (
                <div
                  key={t}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{d}</span>
                    <Badge color="green">{s}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
