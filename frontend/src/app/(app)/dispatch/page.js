'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Eye } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { timeAgo, initials } from '@/lib/constants';
import { PageHeader, Kpi, Panel, Badge, Loading, Empty, StatusBadge } from '@/components/ui';

export default function DispatchPage() {
  const { showToast } = useAuth();
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [p, a, d] = await Promise.all([
        api.orders({ filter: 'Pending', limit: 30 }),
        api.orders({ filter: 'Active', limit: 50 }),
        api.drivers({ limit: 50 }),
      ]);
      setPending((p.data || []).filter((o) => !o.driverId));
      setActive(a.data || []);
      setDrivers(d.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function autoAll() {
    try {
      const res = await api.autoAssignAll(10);
      showToast(`AI auto-assigned ${res.data?.length || 0} orders`);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function autoOne(id) {
    try {
      await api.autoAssign(id);
      showToast('Driver auto-assigned');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <Loading />;

  const delayed = active.filter((o) => o.eta && new Date(o.eta) < new Date());
  const available = drivers.filter((d) => d.status === 'Available');

  return (
    <div>
      <PageHeader
        title="Dispatcher Console"
        subtitle="Assign drivers, balance workloads, resolve delays"
        actions={
          <button className="btn-secondary btn-sm" onClick={autoAll}>
            <Sparkles className="h-3.5 w-3.5" /> Auto-assign all
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Unassigned" value={pending.length} />
        <Kpi label="Active Deliveries" value={active.length} />
        <Kpi label="Delayed" value={delayed.length} />
        <Kpi label="Available Drivers" value={available.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Delivery Queue — Needs Assignment" right={<Badge color="amber">{pending.length} waiting</Badge>}>
          {pending.length === 0 ? (
            <Empty>Queue clear — all orders assigned.</Empty>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 12).map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {o.orderNumber} · {o.product}
                    </div>
                    <div className="text-xs text-slate-400">
                      {o.pickupCity} → {o.dropoffCity} • {o.zone} • {o.priority}
                    </div>
                  </div>
                  <button className="btn-primary btn-sm" onClick={() => autoOne(o._id)}>
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Delayed Shipment Alerts">
            {delayed.length === 0 ? (
              <Empty>No delayed shipments.</Empty>
            ) : (
              delayed.slice(0, 6).map((o) => (
                <div key={o._id} className="flex items-center gap-3 border-b border-slate-50 py-2 last:border-0 dark:border-slate-800">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{o.orderNumber} · SLA breach risk</div>
                    <div className="text-xs text-slate-400">
                      ETA passed {timeAgo(o.eta)} • <StatusBadge status={o.status} />
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-slate-400" />
                </div>
              ))
            )}
          </Panel>
          <Panel title="Available Drivers">
            {available.length === 0 ? (
              <Empty>No drivers available.</Empty>
            ) : (
              available.slice(0, 8).map((d) => (
                <div key={d._id} className="flex items-center gap-3 border-b border-slate-50 py-2 last:border-0 dark:border-slate-800">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    {initials(d.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{d.name}</div>
                    <div className="text-xs text-slate-400">
                      Zone {d.zone} • {d.rating}★ • {d.onTimeRate}% on-time
                    </div>
                  </div>
                  <Badge color="green">Available</Badge>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
