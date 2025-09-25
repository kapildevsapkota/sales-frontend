"use client";

import React, { useState, useEffect } from "react";
import { Gift, Tag, ArrowLeft, Edit2Icon, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import LuckyDrawDetails from "./manage-lucky-draw/LuckyDrawDetails";
import GiftItems from "./manage-lucky-draw/GiftItems";
import Offers from "./manage-lucky-draw/Offers";

import Analytics from "./manage-lucky-draw/Analytics";
import { LuckyDraw } from "@/types/luckyDraw";
import { ApiResponse } from "@/types/luckyDraw";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const ManageLuckyDraw: React.FC = () => {
  const fetchLuckyDraws = async (): Promise<ApiResponse | LuckyDraw[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/lucky-draw-systems/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch lucky draws");
    }

    return await response.json();
  };

  const [luckyDraws, setLuckyDraws] = useState<LuckyDraw[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<LuckyDraw | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroups, setShowGroups] = useState(true);
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createSchema = z.object({
    name: z.string().min(1, "Name is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    description: z.string().min(1, "Description is required"),
    background_image: z.any().optional(),
    hero_image: z.any().optional(),
    main_offer_stamp_image: z.any().optional(),
    qr: z.any().optional(),
  });

  type CreateFormData = z.infer<typeof createSchema>;

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    formState: { errors: createErrors },
    reset: resetCreateForm,
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      start_date: "",
      end_date: "",
      description: "",
      background_image: undefined,
      hero_image: undefined,
      main_offer_stamp_image: undefined,
      qr: undefined,
    },
  });

  const handleCreate = async (data: CreateFormData) => {
    setIsCreating(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof FileList) {
        if (value.length > 0) formData.append(key, value[0]);
      } else if (typeof value === "string") {
        formData.append(key, value);
      }
    });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lucky-draw-systems/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create lucky draw");
      }
      const created: LuckyDraw = await response.json();
      setLuckyDraws((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      resetCreateForm();
      toast({
        title: "Created",
        description: "Lucky draw created successfully",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create lucky draw",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const getLuckyDraws = async () => {
      try {
        const data = await fetchLuckyDraws();
        const list = Array.isArray(data) ? data : data?.results ?? [];
        setLuckyDraws(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    getLuckyDraws();
  }, []);

  // Load initial has_sales_fest to reflect switch state
  useEffect(() => {
    const fetchFestConfig = async () => {
      if (!user?.franchise_id) return;
      try {
        const res = await api.get(`/api/fest-config/${user.franchise_id}/`);
        const data = res.data?.data ?? res.data;
        if (data && typeof data.has_lucky_draw === "boolean") {
          setShowGroups(Boolean(data.has_lucky_draw));
        }
      } catch (err) {
        // silent fail; keep default
        console.error("Failed to fetch fest config:", err);
      }
    };
    fetchFestConfig();
  }, [user?.franchise_id]);

  const handleShowGroupsToggle = async (checked: boolean) => {
    setShowGroups(checked);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("has_lucky_draw", JSON.stringify(checked));
        window.dispatchEvent(
          new CustomEvent("salesfest:updated", {
            detail: { has_lucky_draw: checked },
          })
        );
      }
    } catch (err) {
      console.error("Failed to update sales fest:", err);
    }
    try {
      if (user?.franchise_id) {
        await api.patch(`/api/fest-config/${user.franchise_id}/`, {
          has_lucky_draw: checked,
        });
      }
    } catch (err) {
      console.error("Error updating sales config:", err);
    }
  };

  const handleDrawClick = (draw: LuckyDraw) => setSelectedDraw(draw);
  const handleBackToList = () => setSelectedDraw(null);
  const handleUpdateDraw = (updatedDraw: LuckyDraw) => {
    setLuckyDraws(
      luckyDraws.map((draw) =>
        draw.id === updatedDraw.id ? updatedDraw : draw
      )
    );
    setSelectedDraw(updatedDraw);
  };

  const getStatus = (
    startDate: string,
    endDate: string
  ): "Active" | "Completed" | "Upcoming" => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "Upcoming";
    if (now > end) return "Completed";
    return "Active";
  };

  const getStatusColor = (status: "Active" | "Completed" | "Upcoming") => {
    const colors = {
      Active: "bg-green-500",
      Completed: "bg-blue-500",
      Upcoming: "bg-yellow-500",
    };
    return colors[status];
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center mt-8 p-4 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );

  if (selectedDraw) {
    return (
      <div className="flex flex-col h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="show-lucky-draw" className="text-sm font-medium">
              Show Lucky Draw
            </Label>
            <Switch
              id="show-lucky-draw"
              checked={showGroups}
              onCheckedChange={handleShowGroupsToggle}
            />
          </div>
        </div>
        <Button
          onClick={handleBackToList}
          variant="outline"
          className="mb-6 text-gray-600 hover:text-gray-800 self-start transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <Card className="bg-white rounded-lg overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">
                {selectedDraw.name}
              </CardTitle>
              <Badge
                className={`${getStatusColor(
                  getStatus(selectedDraw.start_date, selectedDraw.end_date)
                )} text-white px-3 py-1 text-sm font-medium rounded-full`}
              >
                {getStatus(selectedDraw.start_date, selectedDraw.end_date)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start bg-gray-100 h-20 p-4 space-x-4">
                {[
                  { value: "details", label: "General", icon: null },
                  { value: "gifts", label: "Gifts", icon: Gift },
                  { value: "offers", label: "Offers", icon: Tag },
                  { value: "analytics", label: "Analytics", icon: BarChart },
                ].map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-white px-4 py-4 rounded-md transition-all duration-200 hover:bg-gray-200"
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="details" className="p-6">
                <LuckyDrawDetails
                  luckyDraw={selectedDraw}
                  onUpdate={handleUpdateDraw}
                />
              </TabsContent>
              <TabsContent value="gifts" className="p-6">
                <GiftItems luckyDrawId={selectedDraw.id} />
              </TabsContent>
              <TabsContent value="offers" className="p-6">
                <Offers luckyDrawId={selectedDraw.id} />
              </TabsContent>
              <TabsContent value="analytics" className="p-6">
                <Analytics luckyDrawId={selectedDraw.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Lucky Draw Systems</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="show-lucky-draw" className="text-sm font-medium">
              Show Lucky Draw
            </Label>
            <Switch
              id="show-lucky-draw"
              checked={showGroups}
              onCheckedChange={handleShowGroupsToggle}
            />
          </div>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(o) => {
              if (!o) resetCreateForm();
              setIsCreateOpen(o);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Lucky Draw</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleCreateSubmit(handleCreate)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "name", label: "Name", type: "text" },
                    {
                      name: "background_image",
                      label: "Background Image",
                      type: "file",
                    },
                    { name: "start_date", label: "Start Date", type: "date" },
                    { name: "end_date", label: "End Date", type: "date" },
                    { name: "description", label: "Description", type: "text" },
                    { name: "hero_image", label: "Hero Image", type: "file" },
                    {
                      name: "main_offer_stamp_image",
                      label: "Main Offer Stamp Image",
                      type: "file",
                    },
                    { name: "qr", label: "QR Code", type: "file" },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        {field.label}
                      </Label>
                      <Controller
                        name={field.name as keyof CreateFormData}
                        control={createControl}
                        render={({ field: { onChange, value, ...rest } }) =>
                          field.type === "file" ? (
                            <Input
                              type="file"
                              onChange={(e) => onChange(e.target.files)}
                              {...rest}
                              className="w-full p-2 border rounded-md"
                            />
                          ) : (
                            <Input
                              type={field.type}
                              value={(value as string) || ""}
                              onChange={onChange}
                              {...rest}
                              className="w-full p-2 border rounded-md"
                            />
                          )
                        }
                      />
                      {createErrors[field.name as keyof CreateFormData] && (
                        <p className="text-red-500 text-sm mt-1">
                          {createErrors[
                            field.name as keyof CreateFormData
                          ]?.message?.toString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetCreateForm();
                      setIsCreateOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
            <Building className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {user?.organization?.name}
            </span>
          </div>
          <Badge className="bg-blue-500 text-white">{user?.role}</Badge>
        </div> */}
      </div>
      <Card className="bg-white rounded-lg overflow-hidden flex-1 shadow-lg">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-lg">Name</TableHead>
                <TableHead className="font-semibold text-lg">
                  Date Range
                </TableHead>
                <TableHead className="font-semibold text-lg">Status</TableHead>
                <TableHead className="font-semibold text-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {luckyDraws.map((draw) => {
                const status = getStatus(draw.start_date, draw.end_date);
                return (
                  <TableRow
                    key={draw.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-lg">
                      {draw.name}
                    </TableCell>
                    <TableCell>{`${new Date(
                      draw.start_date
                    ).toLocaleDateString()} to ${new Date(
                      draw.end_date
                    ).toLocaleDateString()}`}</TableCell>
                    <TableCell>
                      <Badge
                        className={`inline-block ${getStatusColor(
                          status
                        )} text-white px-3 py-1 rounded-full`}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="h-10 w-10 p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                        onClick={() => handleDrawClick(draw)}
                      >
                        <Edit2Icon className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLuckyDraw;
