'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types & Context ───────────────────────────────────────────────────────

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

// ─── Navigation Config ────────────────────────────────────────────────────

const navItems = [
  { href: '/admin', label: 'ড্যাশবোর্ড', icon: 'grid-fill', exact: true },
  { href: '/admin/captions', label: 'ক্যাপশন', icon: 'file-text', exact: false },
  { href: '/admin/categories', label: 'ক্যাটাগরি', icon: 'folder2-open', exact: false },
  { href: '/admin/tags', label: 'ট্যাগ', icon: 'tag-fill', exact: false },
  { href: '/admin/settings', label: 'সেটিংস', icon: 'gear-fill', exact: false },
  { href: '/admin/database', label: 'ডাটাবেজ', icon: 'database-fill', exact: false },
];

// ─── Login Screen ─────────────────────────────────────────────────────────

function LoginScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('পাসওয়ার্ড দিন');
      return;
    }
    const success = login(password);
    if (!success) {
      setError('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <i className="bi bi-shield-lock-fill text-white" style={{fontSize: '32px'}}></i>
            </div>
            <div>
              <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">
                অ্যাডমিন প্যানেল
              </CardTitle>
              <CardDescription className="mt-2">
                CaptionLover অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <i className="bi bi-lock-fill absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '16px'}}></i>
                <Input
                  type="password"
                  placeholder="পাসওয়ার্ড দিন..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="h-12 pl-10"
                  autoFocus
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 dark:text-red-400 p-3 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-purple-500/25"
              >
                প্রবেশ করুন
              </Button>
            </form>
            <p className="text-xs text-center text-gray-400 mt-4">
              ডিফল্ট পাসওয়ার্ড: admin123
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Sidebar Navigation ────────────────────────────────────────────────────

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { logout } = useAdminAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
          <i className="bi bi-shield-lock-fill text-white" style={{fontSize: '20px'}}></i>
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-sm text-purple-900 dark:text-purple-100 truncate">
            CaptionLover
          </h2>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Admin Panel</p>
        </div>
      </div>

      <Separator className="bg-purple-100 dark:bg-purple-800/50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <i className={`bi bi-${item.icon} ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} style={{fontSize: '18px'}}></i>
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500"
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-purple-100 dark:bg-purple-800/50" />

      {/* Footer Links */}
      <div className="p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
        >
          <i className="bi bi-arrow-left" style={{fontSize: '18px'}}></i>
          <span>মূল সাইটে যান</span>
        </Link>
        <button
          onClick={() => {
            logout();
            toast.success('সফলভাবে লগআউট হয়েছে');
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 w-full text-left"
        >
          <i className="bi bi-box-arrow-left" style={{fontSize: '18px'}}></i>
          <span>লগআউট</span>
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Header ──────────────────────────────────────────────────────────

function MobileHeader({ onOpenSidebar, pathname }: { onOpenSidebar: () => void; pathname: string }) {
  const currentNav = navItems.find(
    (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))
  );

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-gray-400" onClick={onOpenSidebar} suppressHydrationWarning>
                <i className="bi bi-list" style={{fontSize: '20px'}}></i>
              </Button>
            </SheetTrigger>
            <SheetTitle className="sr-only">নেভিগেশন মেনু</SheetTitle>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <i className="bi bi-shield-lock-fill text-white" style={{fontSize: '16px'}}></i>
            </div>
            <h1 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {currentNav?.label || 'অ্যাডমিন'}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Desktop Sidebar ────────────────────────────────────────────────────────

function DesktopSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-30">
      <SidebarNav pathname={pathname} />
    </aside>
  );
}

// ─── Mobile Sidebar Sheet ────────────────────────────────────────────────────

function MobileSidebar({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-gray-950">
        <SheetTitle className="sr-only">অ্যাডমিন নেভিগেশন</SheetTitle>
        <SidebarNav pathname={pathname} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Layout ────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Use subscription pattern to avoid lint warning
  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    // Batch state updates via micro-task
    queueMicrotask(() => {
      setMounted(true);
      setIsAuthenticated(admin);
    });
  }, []);

  const login = useCallback((password: string) => {
    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      setIsAuthenticated(true);
      toast.success('সফলভাবে লগইন হয়েছে!');
      return true;
    }
    toast.error('ভুল পাসওয়ার্ড!');
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    router.push('/admin');
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
        <div className="bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/30">
          <LoginScreen />
        </div>
        <Toaster position="top-center" richColors />
      </AdminAuthContext.Provider>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Desktop Sidebar */}
        <DesktopSidebar pathname={pathname} />

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          pathname={pathname}
        />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Mobile Header */}
          <MobileHeader
            onOpenSidebar={() => setMobileOpen(true)}
            pathname={pathname}
          />

          {/* Page Content */}
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </AdminAuthContext.Provider>
  );
}
