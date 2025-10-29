import AdminLogin from '@/components/admin/AdminLogin';
import { PublicRoute } from '@/lib/auth/RouteGuard';

export default function AdminLoginPage() {
  return (
    <PublicRoute redirectIfAuthenticated="/admin/dashboard">
      <AdminLogin />
    </PublicRoute>
  );
}

export const metadata = {
  title: 'Admin Sign In - BookShare',
  description: 'Admin access to BookShare management dashboard.',
};