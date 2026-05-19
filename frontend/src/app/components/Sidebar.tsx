'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../lib/logout';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Icons = {
  dashboard: <Icon><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Icon>,
  exams:     <Icon><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Icon>,
  users:     <Icon><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></Icon>,
  create:    <Icon><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></Icon>,
  results:   <Icon><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>,
  logout:    <Icon><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>,
};

const NAV: Record<string, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/student/dashboard', icon: Icons.dashboard },
  ],
  TEACHER: [
    { label: 'My Exams',    href: '/lecturer/dashboard',   icon: Icons.dashboard },
    { label: 'Create Exam', href: '/lecturer/exam/create', icon: Icons.create },
  ],
  ADMIN: [
    { label: 'Users',  href: '/admin/users', icon: Icons.users },
    { label: 'Exams',  href: '/admin/exams', icon: Icons.exams },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items    = NAV[role] ?? [];

  return (
    <aside className="flex flex-col w-[68px] min-h-screen bg-[#0f172a] flex-shrink-0 items-center py-4 gap-1">
      {/* Logo */}
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base mb-4 flex-shrink-0">
        S
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {items.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative w-full flex items-center justify-center p-3 rounded-xl transition-colors group ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        title="Log out"
        className="relative w-full flex items-center justify-center p-3 rounded-xl text-slate-500 hover:bg-white/10 hover:text-white transition-colors group mx-2"
      >
        {Icons.logout}
        <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
          Log out
        </span>
      </button>
    </aside>
  );
}
