'use client';

import { useEffect, useState } from 'react';
import { Box, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, Kpi, Panel, Badge, Loading, Progress, Empty } from '@/components/ui';

export default function WarehousePage() {
  const { showToast } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [w, inv] = await Promise.all([api.warehouses(), api.inventory()]);
      setWarehouses(w.data || []);
      setInventory(inv.data || []);
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

  const totalCap = warehouses.reduce((s, w) => s + w.capacity, 0) || 1;
  const totalUsed = warehouses.reduce((s, w) => s + w.used, 0);
  const low = inventory.filter((i) => i.stock < i.reorderLevel);
  const queue = warehouses.reduce((s, w) => s + (w.dispatchQueue || 0), 0);

  return (
    <div>
      <PageHeader
        title="Warehouse Management"
        subtitle="Inventory, pick & pack, and dispatch queue"
        actions={
          <>
            <button className="btn-secondary btn-sm" onClick={() => showToast('Barcode scanner ready')}>
              <Box className="h-3.5 w-3.5" /> Scan barcode
            </button>
            <button className="btn-primary btn-sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Warehouses" value={warehouses.length} />
        <Kpi label="Capacity Used" value={`${Math.round((totalUsed / totalCap) * 100)}%`} delta="4%" up />
        <Kpi label="Dispatch Queue" value={queue} />
        <Kpi label="Low-Stock Alerts" value={low.length} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Warehouse Utilization">
          {warehouses.map((w) => {
            const pct = Math.round((w.used / (w.capacity || 1)) * 100);
            return (
              <div key={w._id} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">
                    {w.name} <span className="text-xs text-slate-400">· {w.city}</span>
                  </span>
                  <span className="text-slate-500">
                    {w.used.toLocaleString()}/{w.capacity.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <Progress value={pct} color={pct > 85 ? 'bg-amber-500' : 'bg-sky-500'} />
                <div className="mt-1 text-xs text-slate-400">
                  {w.staff} staff • {w.dispatchQueue} in dispatch queue
                </div>
              </div>
            );
          })}
        </Panel>
        <Panel title="Inventory Alerts">
          {low.length === 0 ? (
            <Empty>All stock levels healthy.</Empty>
          ) : (
            low.map((i) => (
              <div key={i._id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold">{i.product}</div>
                  <div className="text-xs text-slate-400">
                    {i.sku} • bin {i.bin}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-600">{i.stock}</div>
                  <div className="text-xs text-slate-400">reorder {i.reorderLevel}</div>
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel title="Inventory">
        <div className="table-wrap">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-2 py-2">SKU</th>
                <th className="px-2 py-2">Product</th>
                <th className="px-2 py-2">Warehouse</th>
                <th className="px-2 py-2">Bin</th>
                <th className="px-2 py-2">In Stock</th>
                <th className="px-2 py-2">Reorder</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((i) => (
                <tr key={i._id} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="px-2 py-2 font-semibold">{i.sku}</td>
                  <td className="px-2 py-2">{i.product}</td>
                  <td className="px-2 py-2 text-slate-500">{i.warehouseId?.code || i.warehouseId?.name || '—'}</td>
                  <td className="px-2 py-2">{i.bin}</td>
                  <td className="px-2 py-2 font-semibold">{i.stock}</td>
                  <td className="px-2 py-2 text-slate-500">{i.reorderLevel}</td>
                  <td className="px-2 py-2">
                    {i.stock < i.reorderLevel ? <Badge color="amber">Low</Badge> : <Badge color="green">OK</Badge>}
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
