"use client";

import { useEffect, useState } from "react";
import { Filter, Plus, RotateCcw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/contexts/AuthContext";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
} from "@/components/ui/toast";

interface InventoryItem {
  product: string;
  quantity: number;
  id: number;
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
  const [notification, setNotification] = useState<string | null>(null);
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
        setData(result);
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
    return items.filter((item) =>
      item.product.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
      setNotification("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
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

      if (data) {
        const updatedData = { ...data };
        Object.values(updatedData).forEach((distributorData) => {
          distributorData.inventory = distributorData.inventory.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          Object.values(distributorData.franchises).forEach(
            (franchiseInventory) => {
              franchiseInventory.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              );
            }
          );
        });
        setData(updatedData);
      }
      setEditingItem(null);
      setNotification("Quantity updated successfully");
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (user?.role === Role.Distributor && data) {
    const distributorData = Object.values(data)[0];

    return (
      <ToastProvider>
        {notification && (
          <Toast>
            <ToastTitle>{notification}</ToastTitle>
          </Toast>
        )}
        <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              My Franchise Inventory
            </h1>
          </div>

          <div className="bg-background rounded-lg border shadow-sm p-6 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Filter By</span>
              </div>

              <div className="flex-1 min-w-[250px]">
                <Input
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md shadow-sm focus:shadow-md transition-shadow"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {distributorData.franchises &&
            Object.entries(distributorData.franchises).map(
              ([franchiseName, franchiseInventory], fidx) => (
                <Card
                  key={fidx}
                  className="shadow-md hover:shadow-lg transition-shadow mb-8"
                >
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl sm:text-2xl text-primary">
                      {franchiseName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    <div className="rounded-lg border shadow-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                              Product ID
                            </TableHead>
                            <TableHead className="font-semibold">
                              Product
                            </TableHead>
                            <TableHead className="font-semibold">
                              Quantity
                            </TableHead>
                            <TableHead className="font-semibold">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterItems(franchiseInventory).map((item, idx) => (
                            <TableRow
                              key={idx}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="text-muted-foreground">
                                #{(idx + 1).toString().padStart(4, "0")}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.product}
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingItem(item)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Edit Quantity</DialogTitle>
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
                                                  parseInt(e.target.value) || 0,
                                                id: item.id,
                                              }))
                                            }
                                          />
                                        </div>
                                        <Button
                                          onClick={() =>
                                            handleEdit({
                                              ...item,
                                              id: item.id
                                                ? parseInt(item.id.toString())
                                                : 0,
                                              quantity:
                                                editingItem?.quantity || 0,
                                            })
                                          }
                                        >
                                          Save Changes
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Are you sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This
                                          will permanently delete the product
                                          from the inventory.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(item)}
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
              )
            )}
        </div>
        <ToastViewport />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      {notification && (
        <Toast>
          <ToastTitle>{notification}</ToastTitle>
        </Toast>
      )}
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Distributor Inventory
          </h1>
          <Button className="shadow-sm hover:shadow-md transition-shadow">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="bg-background rounded-lg border shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Filter By</span>
            </div>

            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md shadow-sm focus:shadow-md transition-shadow"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {data &&
          Object.entries(data).map(
            ([distributorName, distributorData], index) => (
              <div key={index} className="space-y-8 mb-12">
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl sm:text-2xl text-primary">
                      {distributorName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    <div className="rounded-lg border shadow-sm overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                              Product ID
                            </TableHead>
                            <TableHead className="font-semibold">
                              Product
                            </TableHead>
                            <TableHead className="font-semibold">
                              Quantity
                            </TableHead>
                            <TableHead className="font-semibold">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterItems(distributorData.inventory).map(
                            (item, idx) => (
                              <TableRow
                                key={idx}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="text-muted-foreground">
                                  #{(idx + 1).toString().padStart(4, "0")}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {item.product}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingItem(item)}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            Edit Quantity
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
                                                    parseInt(e.target.value) ||
                                                    0,
                                                  id: item.id,
                                                }))
                                              }
                                            />
                                          </div>
                                          <Button
                                            onClick={() =>
                                              handleEdit({
                                                ...item,
                                                id: item.id
                                                  ? parseInt(item.id.toString())
                                                  : 0,
                                                quantity:
                                                  editingItem?.quantity || 0,
                                              })
                                            }
                                          >
                                            Save Changes
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Are you sure?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete the product
                                            from the inventory.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDelete(item)}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {distributorData.franchises &&
                      Object.entries(distributorData.franchises).map(
                        ([franchiseName, franchiseInventory], fidx) => (
                          <div key={fidx} className="mt-10">
                            <h3 className="text-lg font-semibold mb-4 text-primary/80 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                              {franchiseName}
                            </h3>
                            <div className="rounded-lg border shadow-sm overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">
                                      Product ID
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Product
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Quantity
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filterItems(franchiseInventory).map(
                                    (item, idx) => (
                                      <TableRow
                                        key={idx}
                                        className="hover:bg-muted/30 transition-colors"
                                      >
                                        <TableCell className="text-muted-foreground">
                                          #
                                          {(idx + 1)
                                            .toString()
                                            .padStart(4, "0")}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {item.product}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                          <div className="flex gap-2">
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    setEditingItem(item)
                                                  }
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent>
                                                <DialogHeader>
                                                  <DialogTitle>
                                                    Edit Quantity
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
                                                              parseInt(
                                                                e.target.value
                                                              ) || 0,
                                                            id: item.id,
                                                          })
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                  <Button
                                                    onClick={() =>
                                                      handleEdit({
                                                        ...item,
                                                        id: item.id
                                                          ? parseInt(
                                                              item.id.toString()
                                                            )
                                                          : 0,
                                                        quantity:
                                                          editingItem?.quantity ||
                                                          0,
                                                      })
                                                    }
                                                  >
                                                    Save Changes
                                                  </Button>
                                                </div>
                                              </DialogContent>
                                            </Dialog>

                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                >
                                                  <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>
                                                    Are you sure?
                                                  </AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    This action cannot be
                                                    undone. This will
                                                    permanently delete the
                                                    product from the inventory.
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
                                                  >
                                                    Delete
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )
                      )}
                  </CardContent>
                </Card>
              </div>
            )
          )}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
