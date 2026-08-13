'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ROLES, money, fmtDate } from '@/lib/constants';
import { PageHeader, Kpi, Panel, StatusBadge, Loading, BarChart, Empty } from '@/components/ui';

export default function DashboardPage() {
  const { user, showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.dashboard();
      setData(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading || !data) return <Loading />;

  const { kpis, recentOrders = [], volume = [] } = data;
  const chart = volume.length
    ? volume.map((v) => ({
        label: v._id.slice(5),
        v: v.count,
      }))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ label: d, v: 0 }));

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle={`${ROLES[user.role]} • Real-time overview`}
        actions={
          <>
            <button className="btn-secondary btn-sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            {['admin', 'business', 'dispatcher', 'customer', 'warehouse'].includes(user.role) && (
              <Link href="/orders" className="btn-primary btn-sm">
                <Plus className="h-3.5 w-3.5" /> Orders
              </Link>
            )}
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Kpi label="Total Orders" value={kpis.totalOrders} delta="12%" up />
        <Kpi label="Active Deliveries" value={kpis.activeDeliveries} delta="5%" up />
        <Kpi label="Pending" value={kpis.pending} delta="3%" up={false} />
        <Kpi label="Delivered" value={kpis.delivered} delta="9%" up />
        {['admin', 'business', 'finance'].includes(user.role) ? (
          <>
            <Kpi label="Revenue (MTD)" value={money(kpis.revenue)} delta="14%" up />
            <Kpi label="Failed" value={kpis.failed} delta="2%" up={false} />
          </>
        ) : (
          <>
            <Kpi label="Success focus" value={`${Math.max(0, 100 - kpis.failed)}%`} />
            <Kpi label="Open issues" value={kpis.failed} />
          </>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Delivery Volume — Last 7 Days" right={<span className="badge bg-emerald-100 text-emerald-700">Live</span>}>
            <BarChart data={chart} />
          </Panel>
        </div>
        <Panel title="System Health">
          {[
            ['API Latency', 96, '213 ms'],
            ['GPS Accuracy', 98, '98%'],
            ['On-Time Rate', 95, '95.4%'],
            ['Uptime', 99, '99.9%'],
          ].map(([l, v, d]) => (
            <div key={l} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-500">{l}</span>
                <span className="font-semibold">{d}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <Panel
        title="Recent Orders"
        right={
          <Link href="/orders" className="btn-ghost btn-sm">
            View all →
          </Link>
        }
      >
        <div className="table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-2 py-2 font-semibold">Order</th>
                <th className="px-2 py-2 font-semibold">Customer</th>
                <th className="px-2 py-2 font-semibold">Route</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Amount</th>
                <th className="px-2 py-2 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <Empty />
                  </td>
                </tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="px-2 py-2.5 font-semibold">{o.orderNumber}</td>
                  <td className="px-2 py-2.5">{o.customerName}</td>
                  <td className="px-2 py-2.5 text-slate-500">
                    {o.pickupCity} → {o.dropoffCity}
                  </td>
                  <td className="px-2 py-2.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-2 py-2.5 font-semibold">{money(o.amount)}</td>
                  <td className="px-2 py-2.5 text-slate-500">{fmtDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
