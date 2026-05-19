"use client";

import { MagnifyingGlass, Bell, ShoppingCart } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCartUi } from "@/lib/cart-ui-context";
import { useNotificationUi } from "@/lib/notification-ui-context";
import { useNotifications } from "@/lib/notification-context";

export function TopNavbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { openDrawer } = useCartUi();
  const { openDrawer: openNotifDrawer } = useNotificationUi();
  const { unreadCount } = useNotifications();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/courses?q=${encodeURIComponent(search.trim())}`);
  };

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 w-full h-24 flex items-center justify-between px-4 md:px-10 pt-4 pb-4 bg-canvas-soft/90 backdrop-blur-xl z-40 shrink-0 border-b border-ink/10">
      {/* Left: Branding & Greeting */}
      <div className="flex items-center gap-2 mt-1">
        <span className="hidden sm:inline text-mute font-medium text-lg">Welcome to</span>
        <span className="text-brand font-display font-black text-lg md:text-xl tracking-tight">GenZCoders</span>
      </div>

      {/* Right: Search, Cart, Notifications, Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Search Bar - hidden on mobile unless toggled */}
        <form onSubmit={handleSearch} className={`relative items-center group ${mobileSearchOpen ? 'flex' : 'hidden md:flex'}`}>
          <input 
            type="text" 
            placeholder="Search Intelligence Tracks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px] lg:w-[320px] h-12 pl-6 pr-14 rounded-xl border border-ink bg-canvas text-sm font-semibold text-ink placeholder:text-mute focus:outline-none focus:ring-4 focus:ring-brand/15 focus:border-ink shadow-sm transition-all duration-500"
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg bg-ink text-canvas flex items-center justify-center hover:bg-ink/90 transition-all active:scale-90 shadow-md"
          >
            <MagnifyingGlass size={18} weight="bold" />
          </button>
        </form>
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="flex md:hidden w-12 h-12 rounded-xl border border-ink bg-canvas items-center justify-center text-ink shadow-sm"
          aria-label="Toggle search"
        >
          <MagnifyingGlass size={20} weight="bold" />
        </button>

        {/* Cart */}
        <button
          type="button"
          onClick={() => openDrawer()}
          className="relative w-12 h-12 rounded-xl border border-ink bg-canvas flex items-center justify-center text-ink hover:bg-canvas-soft shadow-sm transition-all hover:shadow-md active:scale-95 group"
        >
          <ShoppingCart size={22} weight="duotone" className="group-hover:scale-110 transition-transform" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-brand-fg text-[10px] font-black flex items-center justify-center border-4 border-canvas-soft shadow-lg">
              {itemCount}
            </span>
          )}
        </button>

        {/* Notification */}
        <button onClick={openNotifDrawer} className="relative w-12 h-12 rounded-xl border border-ink bg-canvas flex items-center justify-center text-ink hover:bg-canvas-soft shadow-sm transition-all hover:shadow-md active:scale-95 group">
          <Bell size={22} weight="duotone" className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-brand-fg text-[10px] font-black flex items-center justify-center border-4 border-canvas-soft shadow-lg">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <Link href="/dashboard/profile" className="flex items-center gap-4 pl-4 cursor-pointer group border-l border-ink/10">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-ink/10 bg-canvas-soft shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
            <Image 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.displayName || "Kacie"}&backgroundColor=f0f0f0`}
              alt="User avatar"
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-ink leading-tight tracking-tight">
              {user?.displayName?.split(" ")[0] || "Student"}
            </span>
            <span className="text-[10px] font-semibold text-mute uppercase tracking-widest">
              Lvl {user?.level || 1} Apprentice
            </span>
          </div>
        </Link>

      </div>
    </header>
  );
}
