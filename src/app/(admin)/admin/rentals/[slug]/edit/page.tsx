import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { RentalForm } from "../../components/rental-form";
import { Rental } from "@/types/rentals";
import axios from "axios";
import ResponsiveContainer from "@/components/common/responsive-container";

async function getRental(slug: string): Promise<Rental> {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${slug}/`
  );
  return response.data;
}

export default async function EditRentalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const rental = await getRental(await (await params).slug);

  return (
    <ResponsiveContainer variant="narrow" paddingX="sm" paddingY="md">
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          </div>
        }
      >
        <RentalForm initialData={rental} />
      </Suspense>
    </ResponsiveContainer>
  );
}
