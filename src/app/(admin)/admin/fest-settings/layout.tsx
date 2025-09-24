import type React from "react";
import Link from "next/link";

export default function FestConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-white p-4 dark:bg-neutral-900">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200">
          Navigation
        </h2>
        <nav className="space-y-1">
          <Link
            href="/admin/fest-settings"
            className="block rounded px-3 py-2 text-sm text-neutral-800 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Sales Group
          </Link>
          <Link
            href="#"
            className="block rounded px-3 py-2 text-sm text-neutral-800 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Lucky Draw
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
