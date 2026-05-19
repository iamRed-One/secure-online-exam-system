'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../lib/logout';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const NAV: Record<string, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/student/dashboard', icon: '🏠' },
  ],
  TEACHER: [
    { label: 'My Exams',    href: '/lecturer/dashboard',    icon: '📋' },
    { label: 'Create Exam', href: '/lecturer/exam/create',  icon: '➕' },
  ],
  ADMIN: [
    { label: 'Users',  href: '/admin/users', icon: '👥' },
    { label: 'Exams',  href: '/admin/exams', icon: '📝' },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items    = NAV[role] ?? [];

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-[#0f172a] text-white flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">S</div>
        <span className="font-semibold text-sm leading-tight">Secure Exam<br/>Portal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge + logout */}
      <div className="px-4 py-5 border-t border-white/10 space-y-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider">{role.toLowerCase()}</p>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>🚪</span> Log out
        </button>
      </div>
    </aside>
  );
}
