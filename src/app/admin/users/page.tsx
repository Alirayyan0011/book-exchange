'use client';

import UserManagement from '@/components/admin/users/UserManagement';
import { ProtectedRoute } from '@/lib/auth/RouteGuard';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <UserManagement />
    </ProtectedRoute>
  );
}