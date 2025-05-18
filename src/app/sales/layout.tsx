import SalesPersonLayout from "@/components/layout/dashboard/SalesPersonLayout";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SalesPersonLayout>{children}</SalesPersonLayout>;
}
