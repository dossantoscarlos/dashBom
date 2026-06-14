"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/contexts/DashboardProvider";
import { navGroupOrder, navGroups, navItems } from "@/lib/data/navigation";

type SidebarProps = {
  userName: string;
  userEmail: string;
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({
  userName,
  userEmail,
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { can } = useDashboard();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const visibleItems = navItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform lg:static lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-950 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          CampanhaPro
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {userName}
        </p>
        <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
          {userEmail}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroupOrder.map((group) => {
          const items = visibleItems.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-4">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {navGroups[group]}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition ${
                        isActive(item.href)
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                          : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <span className="text-sm opacity-70" aria-hidden>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
