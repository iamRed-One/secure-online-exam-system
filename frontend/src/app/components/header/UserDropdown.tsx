"use client";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { logout } from "../../lib/logout";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email?: string; role?: string }>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserInfo({ role: payload.role });
      } catch {}
    }
  }, []);

  // Get initials from role
  const initial = userInfo.role?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(p => !p); }}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-base">
          {initial}
        </span>
        <span className="mr-1 block font-medium text-sm">{userInfo.role ?? "User"}</span>
        <svg
          className="stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          width="18" height="20" viewBox="0 0 18 20" fill="none"
        >
          <path d="M4.3 8.66L9 13.34 13.69 8.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-[260px] flex flex-col p-3">
        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{userInfo.role?.toLowerCase() ?? "User"}</p>
        </div>

        <ul className="flex flex-col gap-1 pb-3 mb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              tag="a"
              href="/profile"
              onItemClick={() => setIsOpen(false)}
              baseClassName=""
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zM2 12a10 10 0 1120 0 10 10 0 01-20 0zm10-4.75a2.02 2.02 0 100 4.04 2.02 2.02 0 000-4.04zm-4.5 9.25a4.5 4.5 0 019 0H7.5z" fill="currentColor"/>
              </svg>
              Edit profile
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={() => { setIsOpen(false); logout(); }}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 w-full text-left"
        >
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.1 19.25h3.4a1.25 1.25 0 001.25-1.25V6a1.25 1.25 0 00-1.25-1.25H15.1M13.5 9.75L9.75 12l3.75 2.25M9.75 12H2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
