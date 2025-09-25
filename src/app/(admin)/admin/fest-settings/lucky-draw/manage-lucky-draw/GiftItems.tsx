"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, X, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GiftItem {
  id: number;
  name: string;
  image: string;
  lucky_draw_system: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GiftItem[];
}

interface GiftItemsProps {
  luckyDrawId: number;
}

const GiftItems: React.FC<GiftItemsProps> = ({ luckyDrawId }) => {
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddGiftOpen, setIsAddGiftOpen] = useState(false);
  const [newGiftName, setNewGiftName] = useState("");
  const [newGiftImage, setNewGiftImage] = useState<File | null>(null);

  useEffect(() => {
    fetchGiftItems();
  }, [luckyDrawId]);

  const fetchGiftItems = async (url?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        url ||
          `${process.env.NEXT_PUBLIC_API_URL}/api/gift-items/?lucky_draw_system_id=${luckyDrawId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch gift items");
      const data = await response.json();
      const items: GiftItem[] = Array.isArray(data)
        ? data
        : Array.isArray((data as ApiResponse)?.results)
        ? (data as ApiResponse).results
        : [];
      setGiftItems(items);
    } catch (error) {
      console.error("Error fetching gift items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gift items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGift = async () => {
    if (!newGiftName || !newGiftImage) return;

    const formData = new FormData();
    formData.append("name", newGiftName);
    formData.append("image", newGiftImage);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gift-items/?lucky_draw_system_id=${luckyDrawId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to add gift item");
      const newGift: GiftItem = await response.json();
      setGiftItems([newGift, ...giftItems]);
      setNewGiftName("");
      setNewGiftImage(null);
      setIsAddGiftOpen(false);
      toast({
        title: "Success",
        description: "Gift item added successfully",
      });
    } catch (error) {
      console.error("Error adding gift item:", error);
      toast({
        title: "Error",
        description: "Failed to add gift item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGift = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gift-items/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete gift item");
      setGiftItems(giftItems.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Gift item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting gift item:", error);
      toast({
        title: "Error",
        description: "Failed to delete gift item",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading gift items...</div>;
  }

  return (
    <Card className="w-full mx-auto rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-200 text-gray-800 p-6">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Gift className="mr-2" /> All Gifts
        </CardTitle>
        <Dialog open={isAddGiftOpen} onOpenChange={setIsAddGiftOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-800 text-white hover:bg-gray-600 transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add New Gift
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-teal-600">
                Add New Gift
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newGiftName}
                  onChange={(e) => setNewGiftName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter gift name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right font-semibold">
                  Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  onChange={(e) => setNewGiftImage(e.target.files?.[0] || null)}
                  className="col-span-3"
                  accept="image/*"
                />
              </div>
            </div>
            <Button
              onClick={handleAddGift}
              className="w-full bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              Add Gift
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6 bg-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {giftItems.map((item) => (
            <Card
              key={item.id}
              className="transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-square">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-full rounded"
                />
                <Button
                  onClick={() => handleDeleteGift(item.id)}
                  size="sm"
                  variant="destructive"
                  className="absolute rounded-full py-3 -top-4 -right-4 bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-2 bg-white">
                <h3 className="text-sm font-semibold text-teal-700 break-words">
                  {item.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftItems;
