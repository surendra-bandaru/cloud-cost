'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '⬡' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/budgets', label: 'Budgets', icon: '🎯' },
  { href: '/dashboard/cloud-accounts', label: 'Cloud Accounts', icon: '☁️' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: '🔔' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">CB</div>
              <span className="font-bold text-white">CloudBilling</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white p-1 rounded">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                  ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-800">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${collapsed ? '' : 'bg-gray-800'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-xs">↩</button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {navItems.find(n => n.href === pathname)?.label ?? 'Dashboard'}
            </h2>
            <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs text-gray-300">Live</span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
              Sync Now
            </button>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
