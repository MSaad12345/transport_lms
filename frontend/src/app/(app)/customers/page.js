'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { money, fmtDate, initials } from '@/lib/constants';
import { PageHeader, Kpi, Panel, Badge, Loading, Empty } from '@/components/ui';

export default function CustomersPage() {
  const { showToast } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(query = q) {
    setLoading(true);
    try {
      const res = await api.customers({ q: query, limit: 100 });
      setCustomers(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const avgOrders =
    customers.length > 0
      ? (customers.reduce((s, c) => s + (c.totalOrders || 0), 0) / customers.length).toFixed(1)
      : '0';

  return (
    <div>
      <PageHeader
        title="Customer Management"
        subtitle="Profiles, order history, loyalty and feedback"
        actions={
          <button className="btn-primary btn-sm" onClick={() => showToast('New customer form opened')}>
            <Plus className="h-3.5 w-3.5" /> Add customer
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Customers" value={customers.length} delta="6%" up />
        <Kpi label="Avg Orders / Customer" value={avgOrders} />
        <Kpi label="Repeat Customers" value={customers.filter((c) => (c.totalOrders || 0) > 1).length} />
        <Kpi
          label="Gold Tier"
          value={customers.filter((c) => c.tier === 'Gold').length}
        />
      </div>

      <div className="mb-3 flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Search customers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button className="btn-secondary btn-sm" onClick={() => load()}>
          Search
        </button>
      </div>

      <Panel title="Customers">
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-2 py-2">Customer</th>
                  <th className="px-2 py-2">Orders</th>
                  <th className="px-2 py-2">Lifetime Spend</th>
                  <th className="px-2 py-2">Points</th>
                  <th className="px-2 py-2">Updated</th>
                  <th className="px-2 py-2">Tier</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <Empty />
                    </td>
                  </tr>
                )}
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {initials(c.name)}
                        </div>
                        <div>
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">{c.totalOrders || 0}</td>
                    <td className="px-2 py-2.5 font-semibold">{money(c.lifetimeSpend || 0)}</td>
                    <td className="px-2 py-2.5">{c.loyaltyPoints || 0}</td>
                    <td className="px-2 py-2.5 text-slate-500">{fmtDate(c.updatedAt)}</td>
                    <td className="px-2 py-2.5">
                      <Badge color={c.tier === 'Gold' ? 'amber' : c.tier === 'Silver' ? 'slate' : 'blue'}>
                        {c.tier || 'Bronze'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
