'use client';
import { logout } from '../lib/logout';

interface NavbarProps {
  title: string;
  role?: string;
}

export default function Navbar({ title, role }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {role && <p className="text-xs text-gray-400 capitalize">{role.toLowerCase()}</p>}
      </div>
      <button
        onClick={logout}
        className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
      >
        Log out
      </button>
    </nav>
  );
}
