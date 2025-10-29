'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  User,
  MessageCircle,
  LogOut,
  ChevronLeft
} from 'lucide-react';

interface AdminSidebarProps {
  activeItem?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeItem = 'dashboard',
  isCollapsed = false,
  onToggleCollapse
}) => {

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard'
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      href: '/admin/users'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/admin/profile'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      href: '/admin/chat'
    }
  ];

  return (
    <div className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen flex flex-col fixed left-0 top-0 z-40`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <Link href="/" className="text-xl font-light text-white tracking-wide">
                BookShare
              </Link>
              <span className="ml-2 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Admin
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft
              className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${
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
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
      <div className="p-4 border-t border-slate-700">
        <button
          className={`flex items-center w-full px-3 py-2 text-slate-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors ${
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

export default AdminSidebar;