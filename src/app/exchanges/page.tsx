'use client';

import { ProtectedRoute } from '@/lib/auth/RouteGuard';
import ExchangesLayout from '@/components/exchanges/ExchangesLayout';

export default function ExchangesPage() {
  return (
    <ProtectedRoute>
      <ExchangesLayout />
    </ProtectedRoute>
  );
}