'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, Kpi, Panel, Loading, BarChart, Progress } from '@/components/ui';

export default function AnalyticsPage() {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .analytics()
      .then((r) => setData(r.data))
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loading />;

  const { kpis, zones = [], topDrivers = [], warehouses = [], heatmap = [] } = data;

  return (
    <div>
      <PageHeader
        title="Reporting & Analytics"
        subtitle="Business KPIs, performance and delivery heatmaps"
        actions={
          <button className="btn-secondary btn-sm" onClick={() => showToast('Analytics report exported')}>
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Delivery Success" value={`${kpis.successRate}%`} delta="3%" up />
        <Kpi label="Avg Delivery Time" value={`${kpis.avgDeliveryMinutes} min`} delta="8%" up />
        <Kpi label="Fleet Utilization" value={`${kpis.fleetUtilization}%`} delta="5%" up />
        <Kpi label="CSAT" value={`${kpis.csat}/5`} delta="0.1" up />
        <Kpi label="Monthly Growth" value={`+${kpis.monthlyGrowth}%`} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Orders by Zone">
            <BarChart data={zones.length ? zones : [{ label: 'N/A', v: 0 }]} />
          </Panel>
        </div>
        <Panel title="Delivery Heatmap (5 weeks)">
          <div className="grid grid-cols-7 gap-1">
            {heatmap.map((v, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm"
                style={{
                  background:
                    v <= 0
                      ? 'rgb(226 232 240)'
                      : `rgba(14, 165, 233, ${0.2 + v * 0.16})`,
                }}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Top Driver Performance">
          <div className="table-wrap">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-2 py-2">Driver</th>
                  <th className="px-2 py-2">Trips</th>
                  <th className="px-2 py-2">On-Time</th>
                  <th className="px-2 py-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map((d) => (
                  <tr key={d._id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-2 py-2 font-semibold">{d.name}</td>
                    <td className="px-2 py-2">{d.deliveries}</td>
                    <td className="px-2 py-2">{d.onTimeRate}%</td>
                    <td className="px-2 py-2">{d.rating}★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Warehouse Performance">
          {warehouses.map((w) => (
            <div key={w.name} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between text-sm">
                <span>{w.name}</span>
                <span className="font-semibold">{w.efficiency}%</span>
              </div>
              <Progress value={w.efficiency} />
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
