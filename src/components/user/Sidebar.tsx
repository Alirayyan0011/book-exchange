'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  LayoutDashboard,
  User,
  BookOpen,
  ArrowLeftRight,
  MessageCircle,
  LogOut,
  ChevronLeft,
  Package
} from 'lucide-react';

interface UserSidebarProps {
  activeItem?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  activeItem = 'dashboard',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/profile'
    },
    {
      id: 'my-books',
      label: 'My Books',
      icon: BookOpen,
      href: '/books'
    },
    {
      id: 'exchanges',
      label: 'Browse Books',
      icon: ArrowLeftRight,
      href: '/exchanges'
    },
    {
      id: 'my-exchanges',
      label: 'My Exchanges',
      icon: Package,
      href: '/exchanges/manage'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      href: '/chat'
    }
  ];

  return (
    <div className={`bg-white border-r border-slate-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col fixed left-0 top-0 z-40`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="text-xl font-light text-slate-800 tracking-wide">
              BookShare
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft
              className={`h-5 w-5 text-slate-600 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeItem === item.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 font-light">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 font-light">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;