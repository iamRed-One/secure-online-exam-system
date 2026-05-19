"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon, UserCircleIcon, ChevronDownIcon, HorizontaLDots,
  DocsIcon, GroupIcon,
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

// Nav items per role
const NAV_BY_ROLE: Record<string, NavItem[]> = {
  STUDENT: [
    { icon: <GridIcon className="w-5 h-5" />, name: "Dashboard", path: "/student/dashboard" },
    { icon: <UserCircleIcon className="w-5 h-5" />, name: "My Profile", path: "/profile" },
  ],
  TEACHER: [
    { icon: <GridIcon className="w-5 h-5" />, name: "My Exams", path: "/lecturer/dashboard" },
    { icon: <DocsIcon className="w-5 h-5" />, name: "Create Exam", path: "/lecturer/exam/create" },
    { icon: <UserCircleIcon className="w-5 h-5" />, name: "My Profile", path: "/profile" },
  ],
  ADMIN: [
    { icon: <GroupIcon className="w-5 h-5" />, name: "Users", path: "/admin/users" },
    { icon: <DocsIcon className="w-5 h-5" />, name: "Exams", path: "/admin/exams" },
    { icon: <UserCircleIcon className="w-5 h-5" />, name: "My Profile", path: "/profile" },
  ],
};

export default function AppSidebar({ role }: { role: string }) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.STUDENT;
  const isActive = useCallback((path: string) => pathname === path || pathname.startsWith(path + "/"), [pathname]);
  const showText = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    navItems.forEach((nav, i) => {
      if (nav.subItems?.some(s => isActive(s.path))) {
        setOpenSubmenu(i);
      }
    });
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight(h => ({ ...h, [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0 }));
    }
  }, [openSubmenu]);

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 flex flex-col bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 px-5
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${showText ? "justify-start" : "lg:justify-center"}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">S</div>
          {showText && <span className="font-bold text-gray-900 dark:text-white text-lg">SecureExam</span>}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          {showText && (
            <h2 className="mb-4 text-xs uppercase leading-5 text-gray-400">Menu</h2>
          )}
          {!showText && <div className="mb-4 flex justify-center"><HorizontaLDots className="w-5 h-5 text-gray-400" /></div>}
          <ul className="flex flex-col gap-1">
            {navItems.map((nav, i) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(o => o === i ? null : i)}
                      className={`menu-item group w-full ${openSubmenu === i ? "menu-item-active" : "menu-item-inactive"} ${!showText ? "lg:justify-center" : "lg:justify-start"}`}
                    >
                      <span className={openSubmenu === i ? "menu-item-icon-active" : "menu-item-icon-inactive"}>{nav.icon}</span>
                      {showText && <span className="menu-item-text">{nav.name}</span>}
                      {showText && <ChevronDownIcon className={`ml-auto w-4 h-4 transition-transform ${openSubmenu === i ? "rotate-180 text-brand-500" : "text-gray-400"}`} />}
                    </button>
                    {showText && (
                      <div
                        ref={el => { subMenuRefs.current[i] = el; }}
                        className="overflow-hidden transition-all duration-300"
                        style={{ height: openSubmenu === i ? `${subMenuHeight[i]}px` : "0px" }}
                      >
                        <ul className="mt-1 space-y-1 ml-9">
                          {nav.subItems.map(sub => (
                            <li key={sub.name}>
                              <Link href={sub.path} className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : nav.path ? (
                  <Link
                    href={nav.path}
                    className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"} ${!showText ? "lg:justify-center" : ""}`}
                  >
                    <span className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>{nav.icon}</span>
                    {showText && <span className="menu-item-text">{nav.name}</span>}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
