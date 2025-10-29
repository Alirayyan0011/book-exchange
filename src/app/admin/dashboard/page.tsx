import AdminDashboard from '@/components/admin/Dashboard';
import { AdminRoute } from '@/lib/auth/RouteGuard';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}

export const metadata = {
  title: 'Admin Dashboard - BookShare',
  description: 'Administrative dashboard for managing BookShare platform.',
};