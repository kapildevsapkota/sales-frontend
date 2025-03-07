"use client";

import { useEffect, useState } from "react";
import { Filter, Plus, RotateCcw, Pencil, Trash2 } from "lucide-react";
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
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
} from "@/components/ui/toast";
import AddProduct from "./addproduct";

interface InventoryItem {
  product: string;
  quantity: number;
  id: number;
}

interface FactoryData {
  factory: string;
  inventory: InventoryItem[];
}

export default function FactoryInventory() {
  const [data, setData] = useState<FactoryData | null>(null);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [notification, setNotification] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No access token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/sales/factory-inventory`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          setData(null);
          setFilteredInventory([]);
          return;
        }

        const result = await response.json();
        if (result && result.length > 0) {
          setData(result[0]);
          setFilteredInventory(result[0].inventory);
        } else {
          setData(null);
          setFilteredInventory([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
        setFilteredInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      const filtered = data.inventory.filter((item) =>
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  }, [searchQuery, data]);

  const handleReset = () => {
    setSearchQuery("");
    if (data) {
      setFilteredInventory(data.inventory);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/sales/inventory/${item.id}/`,
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
        const updatedInventory = data.inventory.filter(
          (inventoryItem) => inventoryItem.id !== item.id
        );
        setData({ ...data, inventory: updatedInventory });
        setFilteredInventory(updatedInventory);
      }
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

    if (!updatedItem.id) {
      console.error("Item ID is undefined");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/sales/inventory/${updatedItem.id}/`,
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
        const updatedInventory = data.inventory.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );
        setData({ ...data, inventory: updatedInventory });
        setFilteredInventory(updatedInventory);
      }
      setEditingItem(null);
      setNotification(true);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <ToastProvider>
      {notification && (
        <Toast>
          <ToastTitle>Edit Successful</ToastTitle>
        </Toast>
      )}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Factory Inventory - {data?.factory}
          </h1>
          <Button onClick={() => setShowAddProduct(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="bg-background rounded-lg border p-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter By</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-red-500"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    #{(index + 1).toString().padStart(4, "0")}
                  </TableCell>
                  <TableCell className="font-medium">{item.product}</TableCell>
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
                                    quantity: parseInt(e.target.value) || 0,
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
                                  quantity: editingItem?.quantity || 0,
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
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the product from the inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
      </div>
      {showAddProduct && (
        <AddProduct onClose={() => setShowAddProduct(false)} />
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
