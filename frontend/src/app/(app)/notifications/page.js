'use client';

import { useEffect, useState } from 'react';
import { Check, Bell } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { timeAgo } from '@/lib/constants';
import { PageHeader, Kpi, Panel, Badge, Loading, Empty } from '@/components/ui';

const CH_COLOR = {
  Email: 'violet',
  SMS: 'blue',
  Push: 'blue',
  WhatsApp: 'green',
  'In-App': 'slate',
};

export default function NotificationsPage() {
  const { showToast } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.notifications({ limit: 50 });
      setItems(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    try {
      await api.markNotificationsRead();
      showToast('All notifications marked read');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <Loading />;

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Multi-channel events across email, SMS, push and WhatsApp"
        actions={
          <button className="btn-secondary btn-sm" onClick={markAll}>
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Unread" value={unread} />
        <Kpi label="Total" value={items.length} />
        <Kpi label="Delivery Rate" value="99.2%" />
        <Kpi label="Channels" value={5} />
      </div>
      <Panel title="Recent Notifications">
        {items.length === 0 ? (
          <Empty />
        ) : (
          items.map((n) => (
            <div
              key={n._id}
              className="flex items-center gap-3 border-b border-slate-50 py-3 last:border-0 dark:border-slate-800"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{n.event}</span>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-sky-500" />}
                </div>
                <div className="text-xs text-slate-400">
                  {n.orderNumber} • {n.customerName} • {timeAgo(n.createdAt)}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{n.message}</div>
              </div>
              <Badge color={CH_COLOR[n.channel] || 'slate'}>{n.channel}</Badge>
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}
