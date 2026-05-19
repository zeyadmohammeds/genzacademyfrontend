"use client";
 
 import Link from "next/link";
 import { usePathname, useRouter } from "next/navigation";
 import { useState, useEffect } from "react";
 import {
   ArrowRight,
   Bell,
   List,
   ShieldCheck,
   SignOut,
   User,
   X,
   ShoppingCart,
 } from "@phosphor-icons/react";
 import { useAuth } from "@/lib/auth-context";
 import { useCart } from "@/lib/cart-context";
 import { useCartUi } from "@/lib/cart-ui-context";
 import { motion, AnimatePresence } from "framer-motion";

const publicLinks = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#courses", label: "Tracks" },
  { href: "#pricing", label: "Pricing" },
  { href: "#team", label: "Team" },
  { href: "#faq", label: "FAQ" },
];

const studentLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
];

const staffLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
];

export function SiteNav() {
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { openDrawer } = useCartUi();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Scroll Spy logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    const sections = ["hero", "about", "courses", "pricing", "team", "faq"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
      setOpen(false);
    }
  };

  const userRoleLower = user?.role?.toLowerCase() || "";
  const isStaff = userRoleLower === "academy_admin" || userRoleLower === "engineer" || userRoleLower === "cta";

  const links = !user
    ? publicLinks
    : isStaff
    ? staffLinks
    : studentLinks;

  const showProfileBanner = user && !user.profileCompleted;

  const isActive = (href: string) => {
    if (href.startsWith("#") && pathname === "/") {
      return activeSection === href.replace("#", "");
    }
    return pathname === href;
  };

  return (
    <>
      {showProfileBanner && (
        <div className="profile-banner">
          <Link href="/onboarding">
            Complete your profile to earn XP
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      )}
      <header className={`site-nav ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="ElSewedy GenZ Coders home">
          <img src="/logo.png" alt="GenZCoders" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="nav-links-wrap" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`relative px-4 py-2 transition-colors ${isActive(link.href) ? "text-brand" : "text-body-copy hover:text-ink"}`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="nav-actions-wrap">
          <button
            type="button"
            onClick={() => openDrawer()}
            className="relative btn-portal flex items-center justify-center"
            style={{ padding: "8px 12px", width: "40px", height: "40px", borderRadius: "50%" }}
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={20} weight="duotone" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 rounded-full bg-brand text-brand-fg text-[9px] font-black flex items-center justify-center border border-white shadow-md animate-bounce">
                {itemCount}
              </span>
            )}
          </button>
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <Link href="/notifications" className="btn-portal" style={{ padding: "8px 12px" }}>
                <Bell size={18} weight="duotone" />
              </Link>
              <Link href="/dashboard" className="btn-portal flex items-center gap-2">
                <User size={16} weight="bold" />
                <span>My Room</span>
              </Link>
              <button className="nav-logout" onClick={logout}>
                <SignOut size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth" className="btn-portal">
                <ShieldCheck size={16} weight="duotone" />
                Sign in
              </Link>
              <Link href="/auth?tab=register" className="btn-join">
                Join Now
              </Link>
            </>
          )}

          <button
            className="nav-hamburger"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu"
          >
            <nav className="flex flex-col gap-4 p-8">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-2xl font-black transition-colors ${isActive(link.href) ? "text-brand" : "text-ink"}`}
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/auth" className="w-full py-4 rounded-2xl bg-zinc-100 text-center font-bold">Sign in</Link>
                  <Link href="/auth?tab=register" className="w-full py-4 rounded-xl bg-brand text-brand-fg text-center font-black">Get Started</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/dashboard" className="w-full py-4 rounded-2xl bg-ink text-canvas text-center font-black">My Room</Link>
                  <button onClick={logout} className="w-full py-4 rounded-2xl border border-black/10 text-center font-bold">Sign out</button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
