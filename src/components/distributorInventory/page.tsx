"use client";

import { useEffect, useState } from "react";
import {
  Filter,
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  Calendar,
  Package2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/contexts/AuthContext";
import AddProduct from "@/components/factory-inventory/components/addproduct";
import { cn } from "@/lib/utils";

interface InventoryItem {
  product: string;
  quantity: number;
  id: number;
  rate?: number;
  lastUpdated?: string;
  status?: string;
}

interface FranchiseData {
  [key: string]: InventoryItem[];
}

interface DistributorData {
  inventory: InventoryItem[];
  franchises: FranchiseData;
}

interface ApiResponse {
  [key: string]: DistributorData;
}

export default function DistributorInventory() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await fetch(
          "https://sales.baliyoventures.com/api/sales/distributor-inventory/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const result = await response.json();

        // Enhance the data with mock rate, lastUpdated, and status for UI purposes
        const enhancedData: ApiResponse = {};

        Object.entries(result).forEach(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([distributorName, distributorData]: [string, any]) => {
            enhancedData[distributorName] = {
              inventory: distributorData.inventory.map(
                (item: InventoryItem) => ({
                  ...item,
                  rate: 1000,
                  lastUpdated: "11 Jan 2025",
                  status: ["Available", "In Stock", "Not Available"][
                    Math.floor(Math.random() * 3)
                  ],
                })
              ),
              franchises: {},
            };

            Object.entries(distributorData.franchises).forEach(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ([franchiseName, franchiseInventory]: [string, any]) => {
                enhancedData[distributorName].franchises[franchiseName] =
                  franchiseInventory.map((item: InventoryItem) => ({
                    ...item,
                    rate: 1000,
                    lastUpdated: "11 Jan 2025",
                    status: ["Available", "In Stock", "Not Available"][
                      Math.floor(Math.random() * 3)
                    ],
                  }));
              }
            );
          }
        );

        setData(enhancedData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterItems = (items: InventoryItem[]) => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply date filter (simplified for demo)
    if (dateFilter) {
      // In a real app, you would filter by date
    }

    // Apply product type filter (simplified for demo)
    if (productTypeFilter) {
      // In a real app, you would filter by product type
    }

    return filtered;
  };

  const handleDelete = async (item: InventoryItem) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        `https://sales.baliyoventures.com/api/sales/inventory/${item.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Update local state to reflect deletion
      if (data) {
        const updatedData = { ...data };
        Object.values(updatedData).forEach((distributorData) => {
          distributorData.inventory = distributorData.inventory.filter(
            (inventoryItem) => inventoryItem.id !== item.id
          );
          Object.values(distributorData.franchises).forEach(
            (franchiseInventory) => {
              franchiseInventory.filter(
                (inventoryItem) => inventoryItem.id !== item.id
              );
            }
          );
        });
        setData(updatedData);
      }

      toast({
        title: "Product deleted",
        description: "The product has been removed from inventory",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (updatedItem: InventoryItem) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        `https://sales.baliyoventures.com/api/sales/inventory/${updatedItem.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            new_quantity: updatedItem.quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Update local state to reflect changes
      if (data) {
        const updatedData = { ...data };
        Object.values(updatedData).forEach((distributorData) => {
          distributorData.inventory = distributorData.inventory.map((item) =>
            item.id === updatedItem.id
              ? { ...updatedItem, lastUpdated: "11 Jan 2025" }
              : item
          );
          Object.values(distributorData.franchises).forEach(
            (franchiseInventory, index) => {
              updatedData[Object.keys(data)[0]].franchises[
                Object.keys(distributorData.franchises)[index]
              ] = franchiseInventory.map((item) =>
                item.id === updatedItem.id
                  ? { ...updatedItem, lastUpdated: "11 Jan 2025" }
                  : item
              );
            }
          );
        });
        setData(updatedData);
      }
      setEditingItem(null);

      toast({
        title: "Product updated",
        description: "The product quantity has been updated",
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Available
          </Badge>
        );
      case "In Stock":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            In Stock
          </Badge>
        );
      case "Not Available":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Not Available
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
    setProductTypeFilter("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              className="mt-4 w-full"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For distributor role, show only their franchises
  if (user?.role === Role.Distributor && data) {
    const distributorData = Object.values(data)[0];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Franchise Inventory</h1>
          <Button
            onClick={() => setShowAddProduct(true)}
            className="gap-2 rounded-full"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-white">
                  <Filter className="h-4 w-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium">Filter By</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-9">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Date" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={productTypeFilter}
                  onValueChange={setProductTypeFilter}
                >
                  <SelectTrigger className="h-9">
                    <div className="flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Product Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="type1">Type 1</SelectItem>
                    <SelectItem value="type2">Type 2</SelectItem>
                    <SelectItem value="type3">Type 3</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Not Available">Not Available</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-9 gap-2"
                >
                  <RotateCcw className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Reset</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Distributor's own inventory table */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 py-4">
            <CardTitle className="text-xl">My Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[120px] font-medium">
                      Product ID
                    </TableHead>
                    <TableHead className="font-medium">Product</TableHead>
                    <TableHead className="font-medium">Quantity</TableHead>
                    <TableHead className="font-medium">
                      Rate per Product
                    </TableHead>
                    <TableHead className="font-medium">Last Updated</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="w-[100px] text-right font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterItems(distributorData.inventory).map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        #{(item.id || index + 1).toString().padStart(4, "0")}
                      </TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.rate}</TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell>
                        {getStatusBadge(item.status || "Unknown")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingItem(item)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Product Quantity</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <div className="text-sm font-medium">
                                    Product: {item.product}
                                  </div>
                                  <Input
                                    type="number"
                                    placeholder="Quantity"
                                    value={editingItem?.quantity || 0}
                                    onChange={(e) =>
                                      setEditingItem((prev) => ({
                                        ...prev!,
                                        quantity:
                                          Number.parseInt(e.target.value) || 0,
                                        id: item.id,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingItem(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleEdit({
                                        ...item,
                                        id: item.id,
                                        quantity: editingItem?.quantity || 0,
                                      })
                                    }
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this product?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {distributorData.franchises &&
          Object.entries(distributorData.franchises).map(
            ([franchiseName, franchiseInventory], fidx) => {
              const filteredItems = filterItems(franchiseInventory);
              const indexOfLastItem = currentPage * itemsPerPage;
              const indexOfFirstItem = indexOfLastItem - itemsPerPage;
              const currentItems = filteredItems.slice(
                indexOfFirstItem,
                indexOfLastItem
              );
              const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

              return (
                <Card key={fidx} className="border shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 py-4">
                    <CardTitle className="text-xl">{franchiseName}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-[120px] font-medium">
                              Product ID
                            </TableHead>
                            <TableHead className="font-medium">
                              Product
                            </TableHead>
                            <TableHead className="font-medium">
                              Quantity
                            </TableHead>
                            <TableHead className="font-medium">
                              Rate per Product
                            </TableHead>
                            <TableHead className="font-medium">
                              Last Updated
                            </TableHead>
                            <TableHead className="font-medium">
                              Status
                            </TableHead>
                            <TableHead className="w-[100px] text-right font-medium">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                              <TableRow
                                key={index}
                                className="hover:bg-muted/50"
                              >
                                <TableCell className="font-medium">
                                  #
                                  {(item.id || index + 1)
                                    .toString()
                                    .padStart(4, "0")}
                                </TableCell>
                                <TableCell>{item.product}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.rate}</TableCell>
                                <TableCell>{item.lastUpdated}</TableCell>
                                <TableCell>
                                  {getStatusBadge(item.status || "Unknown")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingItem(item)}
                                          className="h-8 w-8"
                                        >
                                          <Pencil className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            Edit Product Quantity
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid gap-2">
                                            <div className="text-sm font-medium">
                                              Product: {item.product}
                                            </div>
                                            <Input
                                              type="number"
                                              placeholder="Quantity"
                                              value={editingItem?.quantity || 0}
                                              onChange={(e) =>
                                                setEditingItem((prev) => ({
                                                  ...prev!,
                                                  quantity:
                                                    Number.parseInt(
                                                      e.target.value
                                                    ) || 0,
                                                  id: item.id,
                                                }))
                                              }
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={() =>
                                                setEditingItem(null)
                                              }
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleEdit({
                                                  ...item,
                                                  id: item.id,
                                                  quantity:
                                                    editingItem?.quantity || 0,
                                                })
                                              }
                                            >
                                              Save Changes
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                          <span className="sr-only">
                                            Delete
                                          </span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Product
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this
                                            product? This action cannot be
                                            undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDelete(item)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="h-24 text-center"
                              >
                                No products found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>

                  {filteredItems.length > itemsPerPage && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstItem + 1}-
                        {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
                        {filteredItems.length} items
                      </div>

                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => {
                              const pageNumber = i + 1;
                              return (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(pageNumber)}
                                    isActive={currentPage === pageNumber}
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                          )}

                          {totalPages > 5 && (
                            <>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPage(totalPages)}
                                  isActive={currentPage === totalPages}
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </Card>
              );
            }
          )}

        {showAddProduct && (
          <AddProduct onClose={() => setShowAddProduct(false)} />
        )}
      </div>
    );
  }

  // For admin role, show all distributors and franchises
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Distributor Inventory</h1>
        <Button
          onClick={() => setShowAddProduct(true)}
          className="gap-2 rounded-full"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-white">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium">Filter By</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Date" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={productTypeFilter}
                onValueChange={setProductTypeFilter}
              >
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Product Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="type1">Type 1</SelectItem>
                  <SelectItem value="type2">Type 2</SelectItem>
                  <SelectItem value="type3">Type 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Not Available">Not Available</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleReset}
                className="h-9 gap-2"
              >
                <RotateCcw className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Reset</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data &&
        Object.entries(data).map(
          ([distributorName, distributorData], index) => {
            const filteredItems = filterItems(distributorData.inventory);
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filteredItems.slice(
              indexOfFirstItem,
              indexOfLastItem
            );

            return (
              <div key={index} className="space-y-6">
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader className="border-b bg-muted/30 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <CardTitle className="text-xl font-semibold">
                        {distributorName}
                      </CardTitle>
                      <Button
                        onClick={() => setShowAddProduct(true)}
                        className="gap-2 rounded-full w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[120px] font-medium text-sm">
                              Product ID
                            </TableHead>
                            <TableHead className="font-medium text-sm">
                              Product
                            </TableHead>
                            <TableHead className="font-medium text-sm">
                              Quantity
                            </TableHead>
                            <TableHead className="font-medium text-sm">
                              Rate per Product
                            </TableHead>
                            <TableHead className="font-medium text-sm">
                              Last Updated
                            </TableHead>
                            <TableHead className="font-medium text-sm">
                              Status
                            </TableHead>
                            <TableHead className="w-[100px] text-right font-medium text-sm">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.length > 0 ? (
                            currentItems.map((item, idx) => (
                              <TableRow
                                key={idx}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <TableCell className="font-medium text-sm py-4">
                                  #
                                  {(item.id || idx + 1)
                                    .toString()
                                    .padStart(4, "0")}
                                </TableCell>
                                <TableCell className="text-sm py-4">
                                  {item.product}
                                </TableCell>
                                <TableCell className="text-sm py-4">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-sm py-4">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(item.rate || 0)}
                                </TableCell>
                                <TableCell className="text-sm py-4">
                                  {item.lastUpdated}
                                </TableCell>
                                <TableCell className="text-sm py-4">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "px-4 py-1 rounded-full font-medium",
                                      item.status === "Available" &&
                                        "bg-green-50 text-green-700 border-green-200",
                                      item.status === "In Stock" &&
                                        "bg-yellow-50 text-yellow-700 border-yellow-200",
                                      item.status === "Not Available" &&
                                        "bg-red-50 text-red-700 border-red-200"
                                    )}
                                  >
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingItem(item)}
                                          className="h-8 w-8"
                                        >
                                          <Pencil className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            Edit Product Quantity
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid gap-2">
                                            <div className="text-sm font-medium">
                                              Product: {item.product}
                                            </div>
                                            <Input
                                              type="number"
                                              placeholder="Quantity"
                                              value={editingItem?.quantity || 0}
                                              onChange={(e) =>
                                                setEditingItem((prev) => ({
                                                  ...prev!,
                                                  quantity:
                                                    Number.parseInt(
                                                      e.target.value
                                                    ) || 0,
                                                  id: item.id,
                                                }))
                                              }
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={() =>
                                                setEditingItem(null)
                                              }
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleEdit({
                                                  ...item,
                                                  id: item.id,
                                                  quantity:
                                                    editingItem?.quantity || 0,
                                                })
                                              }
                                            >
                                              Save Changes
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                          <span className="sr-only">
                                            Delete
                                          </span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Product
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this
                                            product? This action cannot be
                                            undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDelete(item)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="h-24 text-center text-muted-foreground"
                              >
                                No products found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Franchise sections */}
                {distributorData.franchises &&
                  Object.entries(distributorData.franchises).map(
                    ([franchiseName, franchiseInventory], fidx) => {
                      const filteredFranchiseItems =
                        filterItems(franchiseInventory);

                      return (
                        <Card
                          key={fidx}
                          className="border shadow-sm overflow-hidden ml-6"
                        >
                          <CardHeader className="border-b bg-muted/20 p-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary/60" />
                              <CardTitle className="text-lg font-medium">
                                {franchiseName}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px] font-medium text-sm">
                                      Product ID
                                    </TableHead>
                                    <TableHead className="font-medium text-sm">
                                      Product
                                    </TableHead>
                                    <TableHead className="font-medium text-sm">
                                      Quantity
                                    </TableHead>
                                    <TableHead className="font-medium text-sm">
                                      Rate per Product
                                    </TableHead>
                                    <TableHead className="font-medium text-sm">
                                      Last Updated
                                    </TableHead>
                                    <TableHead className="font-medium text-sm">
                                      Status
                                    </TableHead>
                                    <TableHead className="w-[100px] text-right font-medium text-sm">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredFranchiseItems.length > 0 ? (
                                    filteredFranchiseItems.map((item, idx) => (
                                      <TableRow
                                        key={idx}
                                        className="hover:bg-muted/50 transition-colors"
                                      >
                                        <TableCell className="font-medium text-sm py-4">
                                          #
                                          {(item.id || idx + 1)
                                            .toString()
                                            .padStart(4, "0")}
                                        </TableCell>
                                        <TableCell className="text-sm py-4">
                                          {item.product}
                                        </TableCell>
                                        <TableCell className="text-sm py-4">
                                          {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-sm py-4">
                                          {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                          }).format(item.rate || 0)}
                                        </TableCell>
                                        <TableCell className="text-sm py-4">
                                          {item.lastUpdated}
                                        </TableCell>
                                        <TableCell className="text-sm py-4">
                                          <Badge
                                            variant="outline"
                                            className={cn(
                                              "px-4 py-1 rounded-full font-medium",
                                              item.status === "Available" &&
                                                "bg-green-50 text-green-700 border-green-200",
                                              item.status === "In Stock" &&
                                                "bg-yellow-50 text-yellow-700 border-yellow-200",
                                              item.status === "Not Available" &&
                                                "bg-red-50 text-red-700 border-red-200"
                                            )}
                                          >
                                            {item.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                          <div className="flex justify-end gap-2">
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    setEditingItem(item)
                                                  }
                                                  className="h-8 w-8"
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                  <span className="sr-only">
                                                    Edit
                                                  </span>
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent>
                                                <DialogHeader>
                                                  <DialogTitle>
                                                    Edit Product Quantity
                                                  </DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                  <div className="grid gap-2">
                                                    <div className="text-sm font-medium">
                                                      Product: {item.product}
                                                    </div>
                                                    <Input
                                                      type="number"
                                                      placeholder="Quantity"
                                                      value={
                                                        editingItem?.quantity ||
                                                        0
                                                      }
                                                      onChange={(e) =>
                                                        setEditingItem(
                                                          (prev) => ({
                                                            ...prev!,
                                                            quantity:
                                                              Number.parseInt(
                                                                e.target.value
                                                              ) || 0,
                                                            id: item.id,
                                                          })
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                  <div className="flex justify-end gap-2">
                                                    <Button
                                                      variant="outline"
                                                      onClick={() =>
                                                        setEditingItem(null)
                                                      }
                                                    >
                                                      Cancel
                                                    </Button>
                                                    <Button
                                                      onClick={() =>
                                                        handleEdit({
                                                          ...item,
                                                          id: item.id,
                                                          quantity:
                                                            editingItem?.quantity ||
                                                            0,
                                                        })
                                                      }
                                                    >
                                                      Save Changes
                                                    </Button>
                                                  </div>
                                                </div>
                                              </DialogContent>
                                            </Dialog>

                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                >
                                                  <Trash2 className="h-4 w-4 text-red-500" />
                                                  <span className="sr-only">
                                                    Delete
                                                  </span>
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>
                                                    Delete Product
                                                  </AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Are you sure you want to
                                                    delete this product? This
                                                    action cannot be undone.
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>
                                                    Cancel
                                                  </AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={() =>
                                                      handleDelete(item)
                                                    }
                                                    className="bg-red-500 hover:bg-red-600"
                                                  >
                                                    Delete
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-muted-foreground"
                                      >
                                        No products found.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
              </div>
            );
          }
        )}

      {showAddProduct && (
        <AddProduct onClose={() => setShowAddProduct(false)} />
      )}
    </div>
  );
}
