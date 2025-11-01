'use client';

import BooksLayout from '@/components/books/BooksLayout';
import { ProtectedRoute } from '@/lib/auth/RouteGuard';

export default function BooksPage() {
  return (
    <ProtectedRoute>
      <BooksLayout />
    </ProtectedRoute>
  );
}