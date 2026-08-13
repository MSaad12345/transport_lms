'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { fmtDate } from '@/lib/constants';
import { PageHeader, Kpi, Panel, Badge, Loading, Progress } from '@/components/ui';

export default function FleetPage() {
  const { showToast } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .vehicles({ limit: 100 })
      .then((r) => setVehicles(r.data || []))
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const available = vehicles.filter((v) => v.status === 'Available').length;
  const onRoute = vehicles.filter((v) => v.status === 'On Route').length;
  const maint = vehicles.filter((v) => v.status === 'Maintenance').length;
  const avgFuel = vehicles.length
    ? Math.round(vehicles.reduce((s, v) => s + v.fuel, 0) / vehicles.length)
    : 0;

  return (
    <div>
      <PageHeader
        title="Fleet Management"
        subtitle="Vehicles, fuel, maintenance and documents"
        actions={
          <button className="btn-primary btn-sm" onClick={() => showToast('Vehicle registration opened')}>
            <Plus className="h-3.5 w-3.5" /> Register vehicle
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Total Vehicles" value={vehicles.length} />
        <Kpi label="On Route" value={onRoute} />
        <Kpi label="Available" value={available} />
        <Kpi label="In Maintenance" value={maint} />
        <Kpi label="Avg Fuel Level" value={`${avgFuel}%`} />
      </div>
      <Panel title="Vehicles">
        <div className="table-wrap">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-2 py-2">Vehicle</th>
                <th className="px-2 py-2">Plate</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Fuel</th>
                <th className="px-2 py-2">Health</th>
                <th className="px-2 py-2">Odometer</th>
                <th className="px-2 py-2">Next Service</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="px-2 py-2.5 font-semibold">{v.code}</td>
                  <td className="px-2 py-2.5">{v.plate}</td>
                  <td className="px-2 py-2.5">{v.type}</td>
                  <td className="px-2 py-2.5">
                    <Badge color={v.status === 'Available' ? 'green' : v.status === 'On Route' ? 'blue' : 'amber'}>
                      {v.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex w-28 items-center gap-2">
                      <div className="flex-1">
                        <Progress value={v.fuel} color={v.fuel < 25 ? 'bg-amber-500' : 'bg-sky-500'} />
                      </div>
                      <span className="text-xs">{v.fuel}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex w-28 items-center gap-2">
                      <div className="flex-1">
                        <Progress value={v.health} color={v.health < 70 ? 'bg-amber-500' : 'bg-emerald-500'} />
                      </div>
                      <span className="text-xs">{v.health}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-slate-500">{v.odometer?.toLocaleString()} km</td>
                  <td className="px-2 py-2.5 text-slate-500">{fmtDate(v.nextService)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
