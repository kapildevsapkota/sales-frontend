"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Distributor {
  id: number;
  name: string;
  short_form: string | null;
  // Add other fields as they come from the API response
}

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [filteredDistributors, setFilteredDistributors] = useState<
    Distributor[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchDistributors();
  }, []);

  useEffect(() => {
    // Filter distributors based on search term
    const filtered = distributors.filter(
      (distributor) =>
        distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distributor.id.toString().includes(searchTerm.toLowerCase())
    );
    setFilteredDistributors(filtered);
  }, [distributors, searchTerm]);

  const fetchDistributors = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get("/api/account/my-distributors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch distributors");
      }

      const data = response.data;
      setDistributors(data.results || data);
    } catch (error) {
      console.error("Error fetching distributors:", error);
      toast({
        title: "Error",
        description: "Failed to load distributors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributorClick = (distributorId: number) => {
    router.push(
      `/super-admin/organization/distributors/${distributorId}/dashboard`
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Distributors</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all distributors
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredDistributors.length} Total
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search distributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Distributors Grid */}
      {filteredDistributors.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No distributors found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "No distributors available"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDistributors.map((distributor) => (
            <Card
              key={distributor.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:border-l-green-600"
              onClick={() => handleDistributorClick(distributor.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {distributor.name}
                    </CardTitle>
                    {distributor.short_form && (
                      <CardDescription className="text-sm text-gray-500 mt-1">
                        {distributor.short_form}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Distributor Info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">
                    Distributor ID: {distributor.id}
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDistributorClick(distributor.id);
                  }}
                >
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
