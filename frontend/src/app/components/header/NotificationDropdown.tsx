"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { BellIcon } from "../../icons";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const handleClick = () => {
    setIsOpen(p => !p);
    setNotifying(false);
  };

  const notifications = [
    { title: "New exam published", desc: "Formal Methods exam is now available", time: "5 min ago" },
    { title: "Exam result ready", desc: "Your CS308 exam has been graded", time: "1 hr ago" },
    { title: "Exam reminder", desc: "Your exam starts in 30 minutes", time: "30 min ago" },
  ];

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        {notifying && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping" />
          </span>
        )}
        <BellIcon className="w-5 h-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="-right-[240px] mt-[17px] h-[360px] w-[350px] flex flex-col p-3 sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.66a.75.75 0 111.06 1.06L13.06 13l4.72 4.72a.75.75 0 11-1.06 1.06L12 14.06l-4.72 4.72a.75.75 0 01-1.06-1.06L10.94 13 6.22 8.34a.75.75 0 010-1.06z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <ul className="flex flex-col overflow-y-auto custom-scrollbar flex-1">
          {notifications.map((n, i) => (
            <li key={i}>
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                baseClassName=""
                className="flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.desc}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                </div>
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}
