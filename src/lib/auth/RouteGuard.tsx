'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.push(redirectTo || '/login');
      return;
    }

    if (requireAdmin && (!isAuthenticated || !user?.isAdmin)) {
      // Not admin, redirect appropriately
      if (!isAuthenticated) {
        router.push('/admin/login');
      } else {
        router.push('/dashboard'); // Regular user trying to access admin
      }
      return;
    }

    // If user is authenticated but trying to access wrong dashboard (but not profile pages)
    if (isAuthenticated && user) {
      const currentPath = window.location.pathname;

      // Don't redirect profile pages
      if (currentPath.includes('/profile')) {
        return;
      }

      if (user.isAdmin && currentPath.startsWith('/dashboard') && !currentPath.startsWith('/admin/dashboard')) {
        router.push('/admin/dashboard');
        return;
      }

      if (!user.isAdmin && currentPath.startsWith('/admin/dashboard')) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireAdmin, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (requireAdmin && (!isAuthenticated || !user?.isAdmin)) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

// Specific guards for common use cases
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={true}>
    {children}
  </RouteGuard>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={true} requireAdmin={true}>
    {children}
  </RouteGuard>
);

export const PublicRoute: React.FC<{ children: React.ReactNode; redirectIfAuthenticated?: string }> = ({
  children,
  redirectIfAuthenticated
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && redirectIfAuthenticated) {
      if (user?.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, redirectIfAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};