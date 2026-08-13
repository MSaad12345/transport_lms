'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { money, initials } from '@/lib/constants';
import { PageHeader, Kpi, Badge, Loading } from '@/components/ui';

export default function DriversPage() {
  const { showToast } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .drivers({ limit: 100 })
      .then((r) => setDrivers(r.data || []))
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const online = drivers.filter((d) => d.status !== 'Offline').length;
  const avgRating = drivers.length
    ? (drivers.reduce((s, d) => s + Number(d.rating || 0), 0) / drivers.length).toFixed(1)
    : '0.0';
  const avgOnTime = drivers.length
    ? Math.round(drivers.reduce((s, d) => s + (d.onTimeRate || 0), 0) / drivers.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="Driver Management"
        subtitle="Availability, performance, earnings and verification"
        actions={
          <button className="btn-primary btn-sm" onClick={() => showToast('Driver onboarding started')}>
            <Plus className="h-3.5 w-3.5" /> Add driver
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Drivers" value={drivers.length} />
        <Kpi label="Online Now" value={online} />
        <Kpi label="Avg Rating" value={`${avgRating} ★`} />
        <Kpi label="Avg On-Time" value={`${avgOnTime}%`} delta="2%" up />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {drivers.map((d) => (
          <div key={d._id} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                {initials(d.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{d.name}</div>
                <div className="text-xs text-slate-400">
                  {d.code} • Zone {d.zone}
                </div>
              </div>
              <Badge
                color={
                  d.status === 'Available'
                    ? 'green'
                    : d.status === 'On Delivery'
                      ? 'blue'
                      : d.status === 'On Break'
                        ? 'amber'
                        : 'slate'
                }
              >
                {d.status}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold">{d.rating}★</div>
                <div className="text-[10px] text-slate-400">Rating</div>
              </div>
              <div>
                <div className="text-sm font-bold">{d.onTimeRate}%</div>
                <div className="text-[10px] text-slate-400">On-time</div>
              </div>
              <div>
                <div className="text-sm font-bold">{d.deliveries}</div>
                <div className="text-[10px] text-slate-400">Trips</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="text-xs text-slate-400">
                Earnings <span className="font-semibold text-slate-700 dark:text-slate-200">{money(d.earnings)}</span>
              </div>
              {d.verified ? <Badge color="green">Verified</Badge> : <Badge color="amber">Pending KYC</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
