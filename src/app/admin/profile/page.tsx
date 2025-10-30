'use client';

import ProfileLayout from '@/components/profile/ProfileLayout';
import { AdminRoute } from '@/lib/auth/RouteGuard';

export default function AdminProfilePage() {
  return (
    <AdminRoute>
      <ProfileLayout isAdmin={true} />
    </AdminRoute>
  );
}