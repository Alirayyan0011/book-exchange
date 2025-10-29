import UserDashboard from '@/components/user/Dashboard';
import { ProtectedRoute } from '@/lib/auth/RouteGuard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
}

export const metadata = {
  title: 'Dashboard - BookShare',
  description: 'Your personal BookShare dashboard to manage your books and exchanges.',
};