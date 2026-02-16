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
import { Building2, Search, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Franchise {
  id: number;
  name: string;
  short_form: string | null;
  distributor: number;
}

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [filteredFranchises, setFilteredFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFranchiseName, setNewFranchiseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchFranchises();
  }, []);

  useEffect(() => {
    // Filter franchises based on search term
    const filtered = franchises.filter(
      (franchise) =>
        franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        franchise.distributor.toString().includes(searchTerm.toLowerCase())
    );
    setFilteredFranchises(filtered);
  }, [franchises, searchTerm]);

  const fetchFranchises = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get("/api/account/my-franchises", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch franchises");
      }

      const data = response.data;
      setFranchises(data.results || data);
    } catch (error) {
      console.error("Error fetching franchises:", error);
      toast({
        title: "Error",
        description: "Failed to load franchises. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFranchiseClick = (franchiseId: number) => {
    router.push(`/super-admin/organization/franchises/${franchiseId}`);
  };

  const handleAddFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFranchiseName.trim()) {
      toast({
        title: "Error",
        description: "Franchise name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.post(
        "/api/account/franchises/",
        { name: newFranchiseName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Franchise added successfully",
        });
        setIsAddDialogOpen(false);
        setNewFranchiseName("");
        fetchFranchises();
      } else {
        throw new Error("Failed to add franchise");
      }
    } catch (error) {
      console.error("Error adding franchise:", error);
      toast({
        title: "Error",
        description: "Failed to add franchise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Franchises</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all franchise locations
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredFranchises.length} Total
          </Badge>
        </div>

        {/* Search and Add Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search franchises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Franchise
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddFranchise}>
                <DialogHeader>
                  <DialogTitle>Add New Franchise</DialogTitle>
                  <DialogDescription>
                    Enter the name of the new franchise you want to add.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Franchise Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Kathmandu Franchise"
                      value={newFranchiseName}
                      onChange={(e) => setNewFranchiseName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Franchise"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Franchises Grid */}
      {filteredFranchises.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No franchises found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "No franchises available"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFranchises.map((franchise) => (
            <Card
              key={franchise.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600"
              onClick={() => handleFranchiseClick(franchise.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1 capitalize">
                      {franchise.name}
                    </CardTitle>

                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Distributor Info */}


                {/* Action Button */}
                <Button
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFranchiseClick(franchise.id);
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
