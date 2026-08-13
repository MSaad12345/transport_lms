'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Route, Truck, AlertTriangle, Clock, BarChart3, Fuel } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { money } from '@/lib/constants';
import { PageHeader, Kpi, Badge, Loading } from '@/components/ui';

const ICONS = {
  route: Route,
  truck: Truck,
  alert: AlertTriangle,
  clock: Clock,
  analytics: BarChart3,
  fuel: Fuel,
};

export default function AIPage() {
  const { showToast } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.aiInsights();
      setInsights(res.data || []);
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

  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="Route optimization, forecasting and predictive operations"
        actions={
          <button
            className="btn-primary btn-sm"
            onClick={() => {
              load();
              showToast('AI route optimization complete');
            }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Run optimization
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Est. Fuel Savings (mo)" value={money(4820)} delta="30%" up />
        <Kpi label="Predicted On-Time" value="96.2%" delta="1.4%" up />
        <Kpi label="Insights" value={insights.length} />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((a) => {
          const Icon = ICONS[a.icon] || Sparkles;
          return (
            <div key={a.title} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{a.title}</div>
                    <Badge color="blue">{a.tag}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{a.text}</p>
                  <button
                    className="btn-secondary btn-sm mt-3"
                    onClick={() => showToast(`Applied: ${a.title}`)}
                  >
                    Apply suggestion
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
