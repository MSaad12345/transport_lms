'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, Panel, StatusBadge, Badge, Loading, Empty } from '@/components/ui';

export default function TrackingPage() {
  const { showToast } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [live, ord] = await Promise.all([
        api.liveTracking(),
        api.orders({ filter: 'Active', limit: 20 }),
      ]);
      setDrivers(live.data || []);
      setOrders(ord.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading />;

  const focus = orders[0];

  return (
    <div>
      <PageHeader
        title="GPS Tracking"
        subtitle="Live fleet locations, ETA and delivery timeline"
        actions={
          <button className="btn-secondary btn-sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Live Map"
            right={<Badge color="green">Live • {drivers.length} drivers</Badge>}
          >
            <div className="relative h-80 overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(135deg,#e2e8f0,#f8fafc_40%,#dbeafe)] bg-[size:28px_28px,28px_28px,auto] dark:border-slate-700 dark:bg-[linear-gradient(rgba(51,65,85,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.35)_1px,transparent_1px),linear-gradient(135deg,#0f172a,#082f49_45%,#0c4a6e)] dark:bg-[size:28px_28px,28px_28px,auto]">
              <div className="absolute inset-[18%_12%_22%_10%] rounded-[40%_60%_45%_55%/50%_40%_60%_50%] border-[3px] border-dashed border-sky-500/70" />
              {drivers.slice(0, 8).map((d, i) => (
                <div
                  key={d._id}
                  title={`${d.name} (${d.status})`}
                  className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-600 shadow"
                  style={{ left: `${12 + ((i * 13) % 76)}%`, top: `${20 + ((i * 27) % 60)}%` }}
                />
              ))}
              <div className="absolute left-[14%] top-[78%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-500 shadow" />
              <div className="absolute left-[88%] top-[24%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow" />
              <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-white/85 px-3 py-2 text-xs dark:bg-slate-900/85">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Driver
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pickup
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Drop-off
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Google Maps / OpenStreetMap ready • geofencing • offline sync • {orders.length} active shipments
            </p>
          </Panel>
        </div>
        <Panel title={focus ? `Focus: ${focus.orderNumber}` : 'No active shipment'}>
          {focus ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{focus.customerName}</span>
                <StatusBadge status={focus.status} />
              </div>
              <div className="text-slate-500">
                {focus.pickupCity} → {focus.dropoffCity}
              </div>
              <div className="text-xs text-slate-400">Zone {focus.zone} • {focus.priority}</div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                <div className="text-xs text-slate-500">Driver</div>
                <div className="font-medium">
                  {focus.driverId?.name || focus.driverId?.code || 'Unassigned'}
                </div>
              </div>
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="In-Transit Shipments">
          <div className="table-wrap">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-2 py-2">Order</th>
                  <th className="px-2 py-2">Driver</th>
                  <th className="px-2 py-2">Route</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <Empty>No shipments in transit right now.</Empty>
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-2 py-2.5 font-semibold">{o.orderNumber}</td>
                    <td className="px-2 py-2.5">{o.driverId?.name || o.driverId?.code || '—'}</td>
                    <td className="px-2 py-2.5 text-slate-500">
                      {o.pickupCity} → {o.dropoffCity}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-2 py-2.5">{o.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
