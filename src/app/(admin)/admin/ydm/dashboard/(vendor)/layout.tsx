"use client";

import { VendorNav } from "@/components/ydm-new/vendors/vendor-nav";

export default function VendorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10">
      <VendorNav />
      {children}
    </div>
  );
}
