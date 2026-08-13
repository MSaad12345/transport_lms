'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { money, money2 } from '@/lib/constants';
import { PageHeader, Kpi, Panel, Badge, Loading, BarChart, Progress } from '@/components/ui';

export default function FinancePage() {
  const { showToast } = useAuth();
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.financeSummary(), api.invoices({ limit: 40 })])
      .then(([s, inv]) => {
        setSummary(s.data);
        setInvoices(inv.data || []);
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <Loading />;

  const methods = summary.paymentMethods || [];
  const totalMethod = methods.reduce((s, m) => s + m.count, 0) || 1;

  return (
    <div>
      <PageHeader
        title="Finance & Payments"
        subtitle="Invoices, payouts, taxes and reconciliation"
        actions={
          <button className="btn-secondary btn-sm" onClick={() => showToast('Financial report exported (CSV)')}>
            <Download className="h-3.5 w-3.5" /> Export report
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue (Paid)" value={money(summary.revenue)} delta="14%" up />
        <Kpi label="Outstanding" value={money(summary.outstanding)} />
        <Kpi label="Driver Payouts" value={money(summary.driverPayouts)} />
        <Kpi label="COD Pending" value={summary.codPending} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Revenue Trend">
            <BarChart
              data={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => ({
                label: m,
                v: 50 + i * 7 + (i % 2) * 8,
              }))}
            />
          </Panel>
        </div>
        <Panel title="Payment Methods">
          {methods.map((m) => (
            <div key={m.method} className="mb-3 last:mb-0">
              <div className="mb-1 flex justify-between text-sm">
                <span>{m.method}</span>
                <span className="font-semibold">{m.count}</span>
              </div>
              <Progress value={(m.count / totalMethod) * 100} />
            </div>
          ))}
        </Panel>
      </div>

      <Panel title="Invoices">
        <div className="table-wrap">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-2 py-2">Invoice</th>
                <th className="px-2 py-2">Order</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Tax</th>
                <th className="px-2 py-2">Total</th>
                <th className="px-2 py-2">Method</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i._id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="px-2 py-2.5 font-semibold">{i.invoiceNumber}</td>
                  <td className="px-2 py-2.5">{i.orderNumber}</td>
                  <td className="px-2 py-2.5">{i.customerName}</td>
                  <td className="px-2 py-2.5">{money2(i.amount)}</td>
                  <td className="px-2 py-2.5 text-slate-500">{money2(i.tax)}</td>
                  <td className="px-2 py-2.5 font-semibold">{money2(i.total)}</td>
                  <td className="px-2 py-2.5">{i.method}</td>
                  <td className="px-2 py-2.5">
                    <Badge color={i.status === 'Paid' ? 'green' : i.status === 'Pending' ? 'amber' : 'red'}>
                      {i.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
