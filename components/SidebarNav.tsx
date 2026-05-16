"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  CheckSquare,
  BookBookmark,
  UsersThree,
  Headphones,
  Gear,
  SignOut,
  SquaresFour,
  ShoppingCart,
  CaretRight,
  CaretLeft,
  CalendarCheck,
  ChartLineUp,
  Certificate,
  Gift,
  Files,
  Student,
  Baby,
  Receipt,
  Upload,
  Notepad,
  MegaphoneSimple,
  Buildings,
  CurrencyDollar,
  ChartBar,
  UsersFour,
  ClipboardText,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";

const studentNav = [
  { href: "/dashboard", icon: SquaresFour, label: "Dashboard" },
  { href: "/courses", icon: BookBookmark, label: "Catalog" },
  { href: "/dashboard/courses", icon: Folder, label: "My Courses" },
  { href: "/applications", icon: ClipboardText, label: "Applications" },
  { href: "/dashboard/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/dashboard/progress", icon: ChartLineUp, label: "Progress" },
  { href: "/dashboard/materials", icon: Files, label: "Materials" },
  { href: "/dashboard/certificates", icon: Certificate, label: "Certificates" },
  //{ href: "/dashboard/referral", icon: Gift, label: "Referrals" },
  //{ href: "/cart", icon: ShoppingCart, label: "Cart" },
  //{ href: "/dashboard/profile", icon: Gear, label: "Settings" },
];

const parentNav = [
  { href: "/parent", icon: SquaresFour, label: "Overview" },
  { href: "/parent/children", icon: Baby, label: "My Children" },
  { href: "/parent/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/parent/invoices", icon: Receipt, label: "Invoices" },
  { href: "/dashboard/profile", icon: Gear, label: "Settings" },
];

const engineerNav = [
  { href: "/engineer", icon: SquaresFour, label: "Overview" },
  { href: "/engineer/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/engineer/courses", icon: Folder, label: "My Courses" },
  { href: "/engineer/students", icon: UsersThree, label: "Students" },
  { href: "/engineer/materials", icon: Upload, label: "Materials" },
  { href: "/engineer/progress", icon: ChartLineUp, label: "Progress" },
  { href: "/dashboard/profile", icon: Gear, label: "Settings" },
];

const ctaNav = [
  { href: "/cta", icon: SquaresFour, label: "Overview" },
  { href: "/cta/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/cta/students", icon: UsersThree, label: "Students" },
  { href: "/cta/notes", icon: Notepad, label: "Notes" },
  { href: "/dashboard/profile", icon: Gear, label: "Settings" },
];

const adminNav = [
  { href: "/admin", icon: SquaresFour, label: "Overview" },
  { href: "/admin/applications", icon: ClipboardText, label: "Applications" },
  { href: "/admin/enrollments", icon: CheckSquare, label: "Enrollments" },
  { href: "/admin/students", icon: Student, label: "Students" },
  { href: "/admin/courses", icon: Folder, label: "Courses" },
  { href: "/admin/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/admin/schools", icon: Buildings, label: "Schools" },
  { href: "/admin/payments", icon: CurrencyDollar, label: "Payments" },
  { href: "/admin/announcements", icon: MegaphoneSimple, label: "Announce" },
  { href: "/admin/team", icon: UsersFour, label: "Team" },
  { href: "/admin/analytics", icon: ChartBar, label: "Analytics" },
];

function getNavByRole(role?: string) {
  switch (role) {
    case "academy_admin":
    case "admin":
      return adminNav;
    case "engineer":
      return engineerNav;
    case "cta":
      return ctaNav;
    case "parent":
      return parentNav;
    default:
      return studentNav;
  }
}

export function SidebarNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  const navItems = getNavByRole(user?.role);

  return (
    <aside 
      className={`sticky top-0 h-screen bg-ink text-canvas-soft flex flex-col py-8 rounded-r-3xl shadow-xl z-40 transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] overflow-hidden ${collapsed ? 'w-[100px]' : 'w-[260px]'}`}
    >
      {/* Top Branding/Logo Area */}

      <button onClick={() => setCollapsed(!collapsed)} className={`flex items-center mb-10 px-6 ${collapsed ? 'justify-center' : 'justify-start'} hover:text-brand cursor-pointer`}>
        <div className="w-12 h-12 rounded-xl bg-canvas-soft/10 flex items-center justify-center shrink-0 shadow-inner border border-brand/35 hover:border-brand hover:scale-110 transition-all">
          <span className="font-display font-black text-xl text-brand">GZ</span>
        </div>
        <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] whitespace-nowrap ml-3 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <span className="font-display font-bold tracking-tight text-lg text-canvas">GenZCoders</span>
        </div>
      </button>

      {/* User Section */}
      {/* <div className={`mb-10 px-4 ${collapsed ? 'text-center' : ''}`}>
         <Link 
           href="/dashboard/profile"
           className={`flex items-center gap-3 p-2 rounded-xl hover:bg-canvas-soft/10 transition-all group ${collapsed ? 'justify-center' : ''}`}
         >
            <div className="w-10 h-10 rounded-lg border border-canvas-soft/15 p-0.5 overflow-hidden shrink-0">
               <img 
                 src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.displayName || 'Student'}&backgroundColor=f0f0f0`} 
                 className="w-full h-full rounded-md bg-canvas-soft/10" 
                 alt="Avatar"
               />
            </div>
            <div className={`overflow-hidden transition-all duration-500 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
               <span className="block text-xs font-bold text-canvas truncate">{user?.displayName || 'Academy Member'}</span>
               <span className="block text-[8px] font-semibold text-mute uppercase tracking-widest">{user?.role || 'student'} Node</span>
            </div>
         </Link>
      </div> */}

      {/* Nav Links */}
      <nav className="flex flex-col gap-3 w-full flex-1 px-4 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && item.href !== "/engineer" && item.href !== "/cta" && item.href !== "/parent" && pathname.startsWith(item.href + "/"));
          const isExact = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center rounded-xl transition-all duration-500 ease-out active:scale-[0.95] overflow-hidden ${
                isExact || isActive
                  ? "bg-brand text-brand-fg shadow-[0_8px_20px_-6px_rgba(159,232,112,0.45)]" 
                  : "bg-transparent text-mute hover:bg-canvas-soft/10 hover:text-canvas"
              } ${collapsed ? 'w-14 h-14 mx-auto justify-center' : 'w-full h-14 px-4'}`}
            >
              <Icon size={22} weight={isExact || isActive ? "fill" : "duotone"} className="shrink-0" />
              
              <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] whitespace-nowrap ${collapsed ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3'}`}>
                 <span className="font-bold text-sm">{item.label}</span>
              </div>

              {/* Tooltip on hover (only when collapsed) */}
              {collapsed && (
                <div className="absolute left-[calc(100%+16px)] px-3 py-1.5 bg-canvas text-ink text-xs font-bold rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="mt-auto px-4 flex flex-col gap-1 pt-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`group flex items-center rounded-xl text-mute hover:bg-canvas-soft/10 hover:text-canvas transition-all duration-500 ease-out active:scale-[0.95] overflow-hidden ${collapsed ? 'w-14 h-14 mx-auto justify-center' : 'w-full h-14 px-4'}`}
        >
          {collapsed ? <CaretRight size={24} weight="bold" /> : <CaretLeft size={24} weight="bold" className="shrink-0" />}
          <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] whitespace-nowrap ${collapsed ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3 text-left'}`}>
             <span className="font-bold text-sm">Collapse</span>
          </div>
        </button>

        <button 
          onClick={logout}
          className={`group flex items-center rounded-xl text-negative/70 hover:bg-negative/10 hover:text-negative transition-all duration-500 ease-out active:scale-[0.95] overflow-hidden ${collapsed ? 'w-14 h-14 mx-auto justify-center' : 'w-full h-14 px-4'}`}
        >
          <SignOut size={24} weight="duotone" className="shrink-0" />
          <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] whitespace-nowrap ${collapsed ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3 text-left'}`}>
             <span className="font-bold text-sm">Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
