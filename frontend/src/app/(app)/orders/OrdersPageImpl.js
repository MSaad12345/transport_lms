'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Eye, UserPlus, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { money, fmtDate } from '@/lib/constants';
import {
  PageHeader,
  Panel,
  StatusBadge,
  Badge,
  Loading,
  Empty,
  Modal,
} from '@/components/ui';
import clsx from 'clsx';

const FILTERS = ['All', 'Active', 'Pending', 'Delivered', 'Issues'];

export default function OrdersPage() {
  const { user, showToast } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [assignOrder, setAssignOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    customerName: '',
    product: '',
    items: 1,
    weightKg: 1,
    priority: 'Standard',
    pickupCity: '',
    dropoffCity: '',
    zone: 'Central',
    amount: 49,
    paymentMethod: 'Card',
    instructions: '',
    warehouseId: '',
  });

  async function load() {
    setLoading(true);
    try {
      const res = await api.orders({ filter, q, limit: 50 });
      setOrders(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  useEffect(() => {
    if (user.role === 'customer') {
      setForm((f) => ({ ...f, customerName: user.name }));
    }
    api.warehouses().then((r) => setWarehouses(r.data || [])).catch(() => {});
  }, [user]);

  const canAssign = ['admin', 'dispatcher'].includes(user.role);

  async function createOrder(e) {
    e.preventDefault();
    try {
      await api.createOrder({
        ...form,
        items: Number(form.items),
        weightKg: Number(form.weightKg),
        amount: Number(form.amount),
        warehouseId: form.warehouseId || undefined,
      });
      showToast('Order created');
      setCreateOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function advance(id) {
    try {
      const res = await api.advanceOrder(id);
      showToast(`Advanced to ${res.data.status}`);
      setDetail(res.data);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function openAssign(order) {
    setAssignOrder(order);
    setSelectedDriver('');
    try {
      const res = await api.drivers({ limit: 50 });
      setDrivers(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function confirmAssign() {
    if (!selectedDriver) return showToast('Select a driver', 'error');
    try {
      await api.assignDriver(assignOrder._id, selectedDriver);
      showToast('Driver assigned');
      setAssignOrder(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function autoAssign(id) {
    try {
      const res = await api.autoAssign(id);
      showToast(`Auto-assigned ${res.data?.driverId?.name || 'driver'}`);
      setAssignOrder(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const counts = useMemo(() => ({ shown: orders.length }), [orders]);

  return (
    <div>
      <PageHeader
        title="Order Management"
        subtitle="Full shipment lifecycle from draft to delivery"
        actions={
          <button className="btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New Order
          </button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={clsx(
              'rounded-full border px-3 py-1 text-xs font-semibold',
              filter === f
                ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            )}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <input
            className="input max-w-xs"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <button className="btn-secondary btn-sm" onClick={load}>
            Search
          </button>
        </div>
      </div>

      <Panel title={`${counts.shown} order${counts.shown === 1 ? '' : 's'}${meta ? ` • page ${meta.page}/${meta.pages}` : ''}`}>
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-2 py-2">Order</th>
                  <th className="px-2 py-2">Customer</th>
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Priority</th>
                  <th className="px-2 py-2">Route</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Pay</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <Empty />
                    </td>
                  </tr>
                )}
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-2 py-2.5 font-semibold">{o.orderNumber}</td>
                    <td className="px-2 py-2.5">{o.customerName}</td>
                    <td className="px-2 py-2.5 text-slate-500">
                      {o.product} ×{o.items}
                    </td>
                    <td className="px-2 py-2.5">
                      <Badge color={o.priority === 'Same-Day' ? 'red' : o.priority === 'Express' ? 'amber' : 'slate'}>
                        {o.priority}
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5 whitespace-nowrap text-slate-500">
                      {o.pickupCity} → {o.dropoffCity}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-2 py-2.5 font-semibold">{money(o.amount)}</td>
                    <td className="px-2 py-2.5">
                      {o.isPaid ? <Badge color="green">Paid</Badge> : <Badge color="amber">{o.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Unpaid'}</Badge>}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex gap-1">
                        <button className="btn-ghost btn-sm" onClick={() => setDetail(o)} title="Details">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canAssign && !o.driverId && !['Delivered', 'Cancelled', 'Returned'].includes(o.status) && (
                          <button className="btn-ghost btn-sm" onClick={() => openAssign(o)} title="Assign">
                            <UserPlus className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Create modal */}
      <Modal
        open={createOpen}
        title="Create New Order"
        onClose={() => setCreateOpen(false)}
        wide
        footer={
          <>
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={createOrder}>
              Create order
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={createOrder}>
          {[
            ['customerName', 'Customer name'],
            ['product', 'Package / item'],
            ['pickupCity', 'Pickup city'],
            ['dropoffCity', 'Drop-off city'],
            ['items', 'Quantity', 'number'],
            ['weightKg', 'Weight (kg)', 'number'],
            ['amount', 'Amount ($)', 'number'],
          ].map(([key, label, type = 'text']) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={['customerName', 'product', 'pickupCity', 'dropoffCity'].includes(key)}
              />
            </div>
          ))}
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Standard</option>
              <option>Express</option>
              <option>Same-Day</option>
            </select>
          </div>
          <div>
            <label className="label">Payment</label>
            <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option>Card</option>
              <option>Wallet</option>
              <option>Cash on Delivery</option>
            </select>
          </div>
          <div>
            <label className="label">Zone</label>
            <select className="input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
              {['Central', 'North', 'South', 'East', 'West'].map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Warehouse</label>
            <select className="input" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
              <option value="">Auto</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Instructions</label>
            <textarea
              className="input min-h-20"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detail}
        title="Order Details"
        onClose={() => setDetail(null)}
        wide
        footer={
          detail && (
            <>
              <button className="btn-secondary" onClick={() => setDetail(null)}>
                Close
              </button>
              {['admin', 'dispatcher', 'warehouse'].includes(user.role) &&
                !['Delivered', 'Cancelled', 'Returned', 'Failed'].includes(detail.status) && (
                  <button className="btn-primary" onClick={() => advance(detail._id)}>
                    Advance status
                  </button>
                )}
            </>
          )
        }
      >
        {detail && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-lg font-bold">{detail.orderNumber}</div>
                <div className="text-xs text-slate-400">
                  Created {fmtDate(detail.createdAt)} • ETA {fmtDate(detail.eta)}
                </div>
              </div>
              <StatusBadge status={detail.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Customer', detail.customerName],
                ['Priority', detail.priority],
                ['Item', `${detail.product} ×${detail.items}`],
                ['Weight', `${detail.weightKg} kg`],
                ['Pickup', detail.pickupCity],
                ['Drop-off', `${detail.dropoffCity} (${detail.zone})`],
                ['Amount', money(detail.amount)],
                ['Payment', `${detail.paymentMethod}${detail.isPaid ? ' · Paid' : ' · Unpaid'}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs text-slate-500">{k}</div>
                  <div className="font-medium">{v}</div>
                </div>
              ))}
            </div>
            {detail.statusHistory?.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold text-slate-500">Status history</div>
                <div className="space-y-2">
                  {[...detail.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">
                      <span className="font-medium">{h.status}</span>
                      <span className="text-xs text-slate-400">{fmtDate(h.at)} {h.note ? `· ${h.note}` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assign modal */}
      <Modal
        open={!!assignOrder}
        title="Assign Driver"
        onClose={() => setAssignOrder(null)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAssignOrder(null)}>
              Cancel
            </button>
            <button className="btn-secondary" onClick={() => autoAssign(assignOrder._id)}>
              <Sparkles className="h-3.5 w-3.5" /> Auto-assign
            </button>
            <button className="btn-primary" onClick={confirmAssign}>
              Assign
            </button>
          </>
        }
      >
        {assignOrder && (
          <div className="space-y-2">
            <p className="mb-3 text-sm text-slate-500">
              Assign a driver to <b>{assignOrder.orderNumber}</b> ({assignOrder.pickupCity} →{' '}
              {assignOrder.dropoffCity}).
            </p>
            {drivers.map((d) => (
              <label
                key={d._id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="driver"
                    value={d._id}
                    checked={selectedDriver === d._id}
                    onChange={() => setSelectedDriver(d._id)}
                  />
                  <div>
                    <div className="text-sm font-semibold">
                      {d.name} · {d.code}
                    </div>
                    <div className="text-xs text-slate-400">
                      Zone {d.zone} • {d.rating}★ • {d.onTimeRate}% on-time
                    </div>
                  </div>
                </div>
                <Badge color={d.status === 'Available' ? 'green' : 'amber'}>{d.status}</Badge>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
