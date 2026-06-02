'use client';
import { useState } from 'react';
import { logout } from '../lib/logout';

interface TopBarProps {
  title: string;
  userEmail?: string;
  role?: string;
}

export default function TopBar({ title, userEmail, role }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initial = userEmail
    ? userEmail[0].toUpperCase()
    : role?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0 z-30">
      {/* Left — page title */}
      <h1 className="text-base font-bold text-slate-800 font-['Outfit']">
        {title}
      </h1>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        {/* <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg> */}
          {/* Red notification dot */}
          {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button> */}

        {/* User avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
              {initial}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                {userEmail && (
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    {role && (
                      <p className="text-xs font-medium text-slate-600 capitalize mt-0.5">{role.toLowerCase()}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
