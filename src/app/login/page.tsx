import Login from '@/components/user/Login';
import { PublicRoute } from '@/lib/auth/RouteGuard';

export default function LoginPage() {
  return (
    <PublicRoute redirectIfAuthenticated="/dashboard">
      <Login />
    </PublicRoute>
  );
}

export const metadata = {
  title: 'Sign In - BookShare',
  description: 'Sign in to your BookShare account to continue sharing and discovering amazing books.',
};