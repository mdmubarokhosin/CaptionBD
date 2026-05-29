"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/* ─── Icon mappings ──────────────────────────────────────────────
 * Lucide React          →  Bootstrap Icons
 * ─────────────────────────────────────────────────────────────
 * Search                →  bi-search
 * Menu                  →  bi-list
 * Heart (filled)        →  bi-heart-fill
 * Moon                  →  bi-moon-fill
 * Sun                   →  bi-sun-fill
 * Home                  →  bi-house-fill
 * Sparkles              →  bi-stars
 * Grid3X3               →  bi-grid-3x3-gap-fill
 * Hash                  →  bi-hash
 *
 * Size mapping (via inline style):
 *   size-4 (16px)  →  style={{ fontSize: '16px' }}
 *   size-5 (20px)  →  style={{ fontSize: '20px' }}
 *   size-6 (24px)  →  style={{ fontSize: '24px' }}
 * ───────────────────────────────────────────────────────────── */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "হোম",
    href: "/",
    icon: <i className="bi bi-house-fill" style={{ fontSize: "16px" }} />,
  },
  {
    label: "ক্যাপশন",
    href: "/captions",
    icon: <i className="bi bi-stars" style={{ fontSize: "16px" }} />,
  },
  {
    label: "ক্যাটাগরি",
    href: "/categories",
    icon: <i className="bi bi-grid-3x3-gap-fill" style={{ fontSize: "16px" }} />,
  },
  {
    label: "ট্যাগ",
    href: "/tags",
    icon: <i className="bi bi-hash" style={{ fontSize: "16px" }} />,
  },
];

/**
 * Fallback HashIcon – kept for potential reuse if bootstrap-icons CDN
 * is unavailable or for any other component that prefers the SVG variant.
 *
 * Bootstrap Icons equivalent: <i className="bi bi-hash" />
 */
function HashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Prevent hydration mismatch from framer-motion and Radix auto-ids
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Sync dark mode state from DOM — reacts to class changes via MutationObserver
  const isDark = useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            <i
              className="bi bi-heart-fill"
              style={{ fontSize: "24px", color: "#8B5CF6" }}
            />
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#a78bfa] bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
              CaptionLover
            </span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-9 w-9" />
          </div>
        </div>
      </header>
    );
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/captions?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* ── Logo ───────────────────────────────────────── */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <i
            className="bi bi-heart-fill"
            style={{ fontSize: "24px", color: "#8B5CF6" }}
          />
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#a78bfa] bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
            CaptionLover
          </span>
        </Link>

        {/* ── Desktop Navigation ──────────────────────────── */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative"
              >
                <motion.span
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#8B5CF6]"
                      : "text-gray-600 hover:bg-purple-50 hover:text-[#8B5CF6]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </motion.span>
                {isActive && (
                  <motion.span
                    layoutId="header-underline"
                    className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-[#8B5CF6]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Search + Actions (Desktop) ──────────────────── */}
        <div className="hidden flex-1 items-center gap-2 md:flex md:max-w-xs lg:max-w-sm">
          <form onSubmit={handleSearch} className="relative w-full">
            <i
              className="bi bi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              style={{ fontSize: "16px" }}
            />
            <Input
              type="search"
              placeholder="ক্যাপশন খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-purple-200 bg-purple-50/50 pl-9 pr-3 text-sm placeholder:text-gray-400 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/20"
            />
          </form>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="text-gray-600 hover:bg-purple-50 hover:text-[#8B5CF6]"
          >
            {isDark ? (
              <i
                className="bi bi-moon-fill"
                style={{ fontSize: "20px" }}
              />
            ) : (
              <i
                className="bi bi-sun-fill"
                style={{ fontSize: "20px" }}
              />
            )}
          </Button>
        </div>

        {/* ── Mobile Controls ─────────────────────────────── */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="text-gray-600 hover:bg-purple-50 hover:text-[#8B5CF6]"
            onClick={() => setMobileOpen(true)}
          >
            <i
              className="bi bi-search"
              style={{ fontSize: "20px" }}
            />
          </Button>

          {/* Mobile menu sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="text-gray-600 hover:bg-purple-50 hover:text-[#8B5CF6]"
                suppressHydrationWarning
              >
                <i
                  className="bi bi-list"
                  style={{ fontSize: "20px" }}
                />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-72 bg-white sm:max-w-sm"
              suppressHydrationWarning
            >
              {/* Accessibility: required by radix dialog */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                CaptionLover navigation links
              </SheetDescription>

              <div className="flex flex-col gap-6 pt-8">
                {/* Mobile logo */}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <i
                    className="bi bi-heart-fill"
                    style={{ fontSize: "20px", color: "#8B5CF6" }}
                  />
                  <span className="bg-gradient-to-r from-[#8B5CF6] to-[#a78bfa] bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                    CaptionLover
                  </span>
                </Link>

                {/* Mobile search */}
                <form onSubmit={handleSearch} className="relative">
                  <i
                    className="bi bi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    style={{ fontSize: "16px" }}
                  />
                  <Input
                    type="search"
                    placeholder="ক্যাপশন খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 border-purple-200 bg-purple-50/50 pl-9 pr-3 placeholder:text-gray-400 focus-visible:border-[#8B5CF6] focus-visible:ring-[#8B5CF6]/20"
                  />
                </form>

                {/* Mobile nav links */}
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <motion.span
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-purple-50 text-[#8B5CF6]"
                              : "text-gray-600 hover:bg-purple-50 hover:text-[#8B5CF6]"
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </motion.span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile dark mode toggle */}
                <div className="border-t border-gray-100 pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:bg-purple-50 hover:text-[#8B5CF6]"
                    onClick={toggleDark}
                  >
                    {isDark ? (
                      <i
                        className="bi bi-moon-fill"
                        style={{ fontSize: "16px" }}
                      />
                    ) : (
                      <i
                        className="bi bi-sun-fill"
                        style={{ fontSize: "16px" }}
                      />
                    )}
                    {isDark ? "ডার্ক মোড" : "লাইট মোড"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
