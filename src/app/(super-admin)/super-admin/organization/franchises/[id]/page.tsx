import { Suspense } from "react";
import FranchiseDetailView from "@/components/franchise/franchise-detail-view";

export default async function FranchisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; tab?: string }>;
}) {
  const { id } = await params;
  const { name, tab } = await searchParams;

  if (!id) {
    return (
      <div className="container mx-auto p-6 text-center text-muted-foreground">
        No franchise id provided
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
          <div className="text-sm text-muted-foreground">Loading franchise...</div>
        </div>
      }
    >
      <FranchiseDetailView id={id} initialName={name} initialTab={tab} />
    </Suspense>
  );
}

