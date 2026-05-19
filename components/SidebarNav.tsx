"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Folder,
  CheckSquare,
  BookBookmark,
  UsersThree,
  Gear,
  SignOut,
  SquaresFour,
  CalendarCheck,
  ChartLineUp,
  Certificate,
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
  CodesandboxLogoIcon,
  CaretRight,
  CaretLeft,
  User,
  ShieldCheck,
  House
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";

const studentNav = [
  { href: "/dashboard", icon: SquaresFour, label: "Dashboard" },
  { href: "/applications", icon: ClipboardText, label: "Applications" },
  { href: "/courses", icon: BookBookmark, label: "Catalog" },
  { href: "/dashboard/courses", icon: Folder, label: "My Courses" },
  { href: "/playground", icon: CodesandboxLogoIcon, label: "Playground" },
  { href: "/dashboard/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/dashboard/progress", icon: ChartLineUp, label: "Progress" },
  { href: "/dashboard/materials", icon: Files, label: "Materials" },
  { href: "/dashboard/certificates", icon: Certificate, label: "Certificates" },
];

const parentNav = [
  { href: "/parent", icon: SquaresFour, label: "Overview" },
  { href: "/parent/children", icon: Baby, label: "My Children" },
  { href: "/parent/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/parent/invoices", icon: Receipt, label: "Invoices" },
];

const engineerNav = [
  { href: "/engineer", icon: SquaresFour, label: "Overview" },
  { href: "/engineer/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/engineer/courses", icon: Folder, label: "My Courses" },
  { href: "/engineer/students", icon: UsersThree, label: "Students" },
  { href: "/engineer/materials", icon: Upload, label: "Materials" },
  { href: "/engineer/progress", icon: ChartLineUp, label: "Progress" },
];

const ctaNav = [
  { href: "/cta", icon: SquaresFour, label: "Overview" },
  { href: "/cta/sessions", icon: CalendarCheck, label: "Sessions" },
  { href: "/cta/students", icon: UsersThree, label: "Students" },
  { href: "/cta/notes", icon: Notepad, label: "Notes" },
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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = getNavByRole(user?.role);

  // Close popup menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* ─────────────────── DESKTOP SIDEBAR ─────────────────── */}
      <aside 
        className={`hidden md:flex sticky top-0 h-screen bg-white text-zinc-900 flex-col py-8 rounded-r-[2.5rem] border-r border-zinc-200/85 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-45 transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${collapsed ? 'w-[96px]' : 'w-[260px]'}`}
      >
        {/* Advanced Double-Ring Edge Collapse Toggle (Notion / Linear style) */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-12 -right-3.5 w-7 h-7 bg-white hover:bg-zinc-950 hover:text-white text-zinc-800 border-2 border-zinc-900 rounded-full flex items-center justify-center shadow-md active:scale-90 cursor-pointer z-50 transition-all duration-300 group/toggle outline-none"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <div className={`transform transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}>
            <CaretLeft size={11} weight="bold" />
          </div>
        </button>

        {/* Top Branding/Logo Area - Clean & Transparent without tight boxes */}
        <div 
          className={`flex items-center mb-10 px-6 ${collapsed ? 'justify-center' : 'justify-start'} relative h-5 w-full`}
        >
          {/* Collapsed state logo */}
          <div className={`absolute mt-3.5 left-6 w-11 h-11 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] bg-zinc-50 border border-zinc-100 rounded-xl p-1.5 ${collapsed ? 'opacity-100 transform-none shadow-sm' : 'opacity-0 scale-50 pointer-events-none'}`}>
            <img src="/logoss.png" alt="GenZCoders" className="max-w-full max-h-full object-contain" />
          </div>
          
          {/* Expanded state logo - Large, transparent, without tight borders */}
          <div className={`absolute mt-3 left-16 right-6 h-16 flex items-center justify-start transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] origin-left ${collapsed ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 transform-none'}`}>
            <img src="/logo.png" alt="GenZCoders" className="max-w-[170px] max-h-12 object-contain" />
          </div>
        </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2 w-full flex-1 px-4 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && item.href !== "/engineer" && item.href !== "/parent" && pathname.startsWith(item.href + "/"));
            const isExact = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
              className={`group relative flex items-center rounded-2xl transition-all duration-500 ease-out active:scale-[0.96] overflow-hidden ${
                  isExact || isActive
                  ? "bg-brand text-white shadow-[0_6px_20px_rgba(255,26,26,0.3)] border border-[#ff1a1a]/10 !text-white" 
                    : "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              } ${collapsed ? 'w-14 h-14 mx-auto justify-center' : 'w-full h-14 px-4'}`}
                style={isExact || isActive ? { color: '#ffffff' } : undefined}
              >
              <Icon size={22} weight={isExact || isActive ? "fill" : "duotone"} className="shrink-0" />
                
                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] whitespace-nowrap ${collapsed ? 'w-0 opacity-0 ml-0' : 'w-full opacity-100 ml-3'}`}>
                 <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>

                {/* Active Indicator bar */}
                {(isExact || isActive) && !collapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-l-full" />
                )}

              {/* Tooltip on hover (only when collapsed) */}
                {collapsed && (
                  <div className="absolute left-[calc(100%+16px)] px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider rounded-lg opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

      {/* Advanced Bottom User Profile Card with Dynamic Options Popup */}
        <div className="mt-auto px-4 pt-4 border-t border-zinc-100 relative" ref={menuRef}>
          
          {/* Floating Advanced Options Popover Menu */}
          {menuOpen && (
            <div className={`absolute bottom-20 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-[2rem] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${collapsed ? 'left-4 w-60' : 'left-4 right-4'}`}>
              <div className="pb-3 mb-3 border-b border-zinc-100">
              <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Signed in as</span>
                <span className="block text-xs font-black text-zinc-900 truncate">{user?.email}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 text-xs font-black transition-all active:scale-98 text-left"
                >
                  <User size={18} weight="fill" className="text-zinc-500" />
                  <span>Personal Settings</span>
                </button>

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-700 text-xs font-black transition-all active:scale-98 text-left"
                >
                  <SignOut size={18} weight="fill" className="text-red-400" />
                  <span>Secure Log Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Card Element */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 rounded-3xl p-3 flex items-center gap-2.5 active:scale-[0.97] transition-all duration-300 relative group cursor-pointer outline-none ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-200 shrink-0 relative">
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.displayName || "Kacie"}&backgroundColor=f0f0f0`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            
            {!collapsed && (
              <div className="min-w-0 text-left flex-1 pr-1">
                <span className="block text-xs font-black text-zinc-900 truncate leading-none mb-1 group-hover:text-brand transition-colors">
                  {user?.displayName || "Demo Student"}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-[#ff1a1a] bg-[#ffe6e6] px-1.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                  <ShieldCheck size={8} weight="fill" /> {user?.role || "Student"}
                </span>
              </div>
            )}
            
            {!collapsed && (
              <div className="flex flex-col gap-0.5 text-zinc-400 shrink-0">
                <span className="w-1.5 h-0.5 bg-zinc-400 rounded-full"></span>
                <span className="w-1.5 h-0.5 bg-zinc-400 rounded-full"></span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ─────────────────── RESPONSIVE MOBILE BOTTOM NAVIGATION BAR ─────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-zinc-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 flex items-center justify-around px-4">
        
        {/* Dashboard Link */}
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === "/dashboard" ? "text-brand scale-105" : "text-zinc-400"}`}
        >
          <House size={20} weight={pathname === "/dashboard" ? "fill" : "regular"} />
          <span className="text-[9px] font-black tracking-tighter uppercase mt-1">Home</span>
        </Link>

        {/* Courses/Catalog Link */}
        <Link 
          href="/courses" 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === "/courses" ? "text-brand scale-105" : "text-zinc-400"}`}
        >
          <BookBookmark size={20} weight={pathname === "/courses" ? "fill" : "regular"} />
          <span className="text-[9px] font-black tracking-tighter uppercase mt-1">Catalog</span>
        </Link>

        {/* Playground Link */}
        <Link 
          href="/playground" 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname?.startsWith("/playground") ? "text-brand scale-105" : "text-zinc-400"}`}
        >
          <CodesandboxLogoIcon size={20} weight={pathname?.startsWith("/playground") ? "fill" : "regular"} />
          <span className="text-[9px] font-black tracking-tighter uppercase mt-1">Sandbox</span>
        </Link>

        {/* My Courses Link */}
        <Link 
          href="/dashboard/courses" 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === "/dashboard/courses" ? "text-brand scale-105" : "text-zinc-400"}`}
        >
          <Folder size={20} weight={pathname === "/dashboard/courses" ? "fill" : "regular"} />
          <span className="text-[9px] font-black tracking-tighter uppercase mt-1">Tracks</span>
        </Link>

        {/* Profile Settings Link */}
        <Link 
          href="/dashboard/profile" 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${pathname === "/dashboard/profile" ? "text-brand scale-105" : "text-zinc-400"}`}
        >
          <div className="relative">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.displayName || "Kacie"}&backgroundColor=f0f0f0`}
              alt="Avatar"
              className="w-5 h-5 rounded-md object-cover border border-zinc-200"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 border border-white rounded-full"></span>
          </div>
          <span className="text-[9px] font-black tracking-tighter uppercase mt-1">Profile</span>
        </Link>

      </div>
    </>
    );
}
