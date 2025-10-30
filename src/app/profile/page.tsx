'use client';

import ProfileLayout from '@/components/profile/ProfileLayout';
import { ProtectedRoute } from '@/lib/auth/RouteGuard';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileLayout isAdmin={false} />
    </ProtectedRoute>
  );
}