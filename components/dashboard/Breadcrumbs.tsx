"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { breadcrumbLabels } from "@/lib/data/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = breadcrumbLabels[segment] ?? segment;
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Navegação estrutural" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
                /
              </span>
            )}
            {crumb.isLast ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-zinc-700 hover:underline dark:hover:text-zinc-200"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
