'use client';

import UserManagement from '@/components/admin/users/UserManagement';
import { AdminRoute } from '@/lib/auth/RouteGuard';

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <UserManagement />
    </AdminRoute>
  );
}