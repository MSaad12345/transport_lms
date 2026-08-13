import { Suspense } from 'react';
import OrdersClient from './OrdersClient';
import { Loading } from '@/components/ui';

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading label="Loading orders…" />}>
      <OrdersClient />
    </Suspense>
  );
}
