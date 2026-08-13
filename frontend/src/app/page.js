'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [loading, isAuthenticated, router]);

  return <Loading label="Starting LMS…" />;
}
