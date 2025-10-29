import Register from '@/components/user/Register';
import { PublicRoute } from '@/lib/auth/RouteGuard';

export default function RegisterPage() {
  return (
    <PublicRoute redirectIfAuthenticated="/dashboard">
      <Register />
    </PublicRoute>
  );
}

export const metadata = {
  title: 'Create Account - BookShare',
  description: 'Join the BookShare community and start sharing and discovering amazing books with fellow readers.',
};