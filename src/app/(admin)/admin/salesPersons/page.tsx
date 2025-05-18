"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Correct hook for app directory

interface SalesPerson {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

export default function SalesPersonsPage() {
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const router = useRouter(); // ✅ Correct usage

  const fetchSalesPersons = async () => {
    try {
      const response = await api.get("/api/account/users/");
      const filtered = response.data.filter(
        (user: SalesPerson) => user.role === "SalesPerson"
      );
      console.log(filtered);
      setSalesPersons(filtered);
    } catch (error) {
      console.error("Failed to fetch sales persons:", error);
    }
  };

  useEffect(() => {
    fetchSalesPersons();
  }, []);

  return (
    <div className="container mx-auto space-y-6 sm:p-4 md:p-6">
      <h1 className="text-2xl font-bold">Sales Persons</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesPersons.map((person) => (
          <Card
            key={person.id}
            onClick={() =>
              router.push(`/admin/salesPersons/${person.phone_number}`)
            }
            className="cursor-pointer hover:shadow-md transition"
          >
            <CardHeader>
              <CardTitle>
                {person.first_name} {person.last_name}
              </CardTitle>
              <CardDescription>{person.phone_number}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
