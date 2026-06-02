"use client";
import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { BellIcon } from "../../icons";
import apiFetch from "../../lib/api";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  EXAM_STARTING_SOON_30: "⏰",
  EXAM_STARTING_SOON_10: "⏰",
  EXAM_NOW_OPEN:         "🟢",
  SESSION_FLAGGED_STUDENT: "🚨",
  STUDENT_FLAGGED_TEACHER: "🚨",
  RESULT_READY:          "📋",
  ALL_SUBMITTED:         "✅",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen]           = useState(false);
  const [notifications, setNotifs]    = useState<Notification[]>([]);
  const [unread, setUnread]           = useState(0);
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchNotifications() {
    try {
      const data = await apiFetch("/notifications");
      setNotifs(data.notifications);
      setUnread(data.unread);
    } catch {
      // silent — don't disrupt the UI if this fails
    }
  }

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  async function handleOpen() {
    setIsOpen(p => !p);
    if (!isOpen && unread > 0) {
      setUnread(0);
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      try { await apiFetch("/notifications/read", { method: "PATCH" }); } catch {}
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
            {unread > 9 ? "9+" : unread}
            <span className="absolute inline-flex w-full h-full bg-red-500 rounded-full opacity-75 animate-ping" />
          </span>
        )}
        <BellIcon className="w-5 h-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="-right-[240px] mt-[17px] h-[380px] w-[350px] flex flex-col p-3 sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
            )}
          </h5>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.66a.75.75 0 111.06 1.06L13.06 13l4.72 4.72a.75.75 0 11-1.06 1.06L12 14.06l-4.72 4.72a.75.75 0 01-1.06-1.06L10.94 13 6.22 8.34a.75.75 0 010-1.06z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col overflow-y-auto custom-scrollbar flex-1">
          {notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm gap-2 py-8">
              <BellIcon className="w-8 h-8 opacity-30" />
              <span>No notifications yet</span>
            </li>
          ) : (
            notifications.map(n => (
              <li key={n.id}>
                <DropdownItem
                  onItemClick={() => setIsOpen(false)}
                  baseClassName=""
                  className={`flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 transition-colors ${!n.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-base">
                    {TYPE_ICON[n.type] ?? "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-800 dark:text-white/90 leading-snug ${!n.read ? "font-semibold" : ""}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <span className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
