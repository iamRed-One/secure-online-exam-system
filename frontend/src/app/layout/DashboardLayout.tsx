'use client';
import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';

interface DashboardLayoutProps {
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  children: React.ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const sidebarWidth =
    isExpanded || isMobileOpen ? 'lg:ml-[290px]' : isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]';

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: isDark ? '#101828' : '#f9fafb' }}
    >
      <AppSidebar role={role} />
      <Backdrop />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarWidth}`}
      >
        <AppHeader />
        <main
          className="flex-1 p-6 lg:p-8"
          style={{ backgroundColor: isDark ? '#111927' : '#f3f4f6' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
