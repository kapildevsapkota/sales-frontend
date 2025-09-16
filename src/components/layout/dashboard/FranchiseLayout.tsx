"use client";

import { Role, useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "./navbar/navbar";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export default function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const lastScrollYRef = React.useRef(0);
  const touchStartYRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const lastY = lastScrollYRef.current;
      if (currentY > lastY) {
        // scrolling down
        setHasScrolled(true);
      } else if (currentY < lastY) {
        // scrolling up
        setHasScrolled(false);
      }
      lastScrollYRef.current = currentY;
    };

    // Listen to window scroll for normal pages
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  React.useEffect(() => {
    // Reset when route changes
    setHasScrolled(false);

    if (!pathname?.includes("/admin/salesfest")) return;

    // On salesfest, body scroll is disabled. Detect scroll intent via wheel/touch/key.
    const reveal = () => setHasScrolled(true);
    const hide = () => setHasScrolled(false);
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "PageDown" ||
        e.key === "PageUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === " "
      ) {
        if (e.key === "PageUp" || e.key === "ArrowUp") hide();
        else reveal();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) reveal();
      else if (e.deltaY < 0) hide();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = e.touches[0]?.clientY ?? null;
      if (startY == null || currentY == null) return;
      if (currentY < startY) reveal(); // finger moves up => scroll down
      if (currentY > startY) hide(); // finger moves down => scroll up
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("wheel", handleWheel as EventListener);
      window.removeEventListener(
        "touchstart",
        handleTouchStart as EventListener
      );
      window.removeEventListener("touchmove", handleTouchMove as EventListener);
      window.removeEventListener("keydown", handleKey);
    };
  }, [pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== Role.Franchise && user?.role !== Role.Distributor) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-6 max-w-md w-full">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl text-red-500">🔒</span>
            <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
            <p className="text-gray-500 text-center">
              You are not authorized to access this page.
            </p>
          </div>
          <div className="flex gap-4 w-full">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => logout()}
            >
              Logout
            </Button>
            <Button className="flex-1" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen">
      {(!pathname?.includes("/admin/salesfest") || hasScrolled) && (
        <AppHeader />
      )}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
