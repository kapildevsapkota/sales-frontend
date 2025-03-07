"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpDown,
  Building,
  Check,
  ChevronDown,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Store,
  User,
} from "lucide-react";

// Mock data for retailers
const retailers = [
  {
    id: 1,
    name: "Kathmandu Central Store",
    type: "Franchise",
    owner: "Ram Sharma",
    location: "Thamel, Kathmandu",
    contact: "+977 9801234567",
    status: "active",
    lastOrder: "2023-09-15",
    totalOrders: 24,
  },
  {
    id: 2,
    name: "Pokhara Beauty Shop",
    type: "Franchise",
    owner: "Sita Gurung",
    location: "Lakeside, Pokhara",
    contact: "+977 9802345678",
    status: "active",
    lastOrder: "2023-09-12",
    totalOrders: 18,
  },
  {
    id: 3,
    name: "Lalitpur Cosmetics",
    type: "Retailer",
    owner: "Hari Thapa",
    location: "Patan, Lalitpur",
    contact: "+977 9803456789",
    status: "active",
    lastOrder: "2023-09-10",
    totalOrders: 15,
  },
  {
    id: 4,
    name: "Bhaktapur Beauty Center",
    type: "Retailer",
    owner: "Gita Shrestha",
    location: "Durbar Square, Bhaktapur",
    contact: "+977 9804567890",
    status: "inactive",
    lastOrder: "2023-08-25",
    totalOrders: 8,
  },
  {
    id: 5,
    name: "Butwal Hair Salon",
    type: "Franchise",
    owner: "Bikash Rai",
    location: "Main Road, Butwal",
    contact: "+977 9805678901",
    status: "pending",
    lastOrder: null,
    totalOrders: 0,
  },
  {
    id: 6,
    name: "Biratnagar Cosmetics",
    type: "Retailer",
    owner: "Sunita Limbu",
    location: "Central Market, Biratnagar",
    contact: "+977 9806789012",
    status: "pending",
    lastOrder: null,
    totalOrders: 0,
  },
];

const RetailersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter retailers based on search term, type filter, and status filter
  const filteredRetailers = retailers.filter((retailer) => {
    const matchesSearch =
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? retailer.type === typeFilter : true;
    const matchesStatus = statusFilter
      ? retailer.status === statusFilter
      : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Retailers Management</h2>
          <p className="text-muted-foreground">
            Manage your franchises and retailers
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Retailer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Retailers
            </CardTitle>
            <Store className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retailers.length}</div>
            <p className="text-xs text-muted-foreground">
              {retailers.filter((r) => r.type === "Franchise").length}{" "}
              franchises,{" "}
              {retailers.filter((r) => r.type === "Retailer").length} retailers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retailers.filter((r) => r.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active retailers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ChevronDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retailers.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Building className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retailers.filter((r) => r.status === "inactive").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently inactive</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retailers List</CardTitle>
          <CardDescription>
            View and manage your franchises and retailers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, owner, or location..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[150px]"
              value={typeFilter || ""}
              onChange={(e) => setTypeFilter(e.target.value || null)}
            >
              <option value="">All Types</option>
              <option value="Franchise">Franchise</option>
              <option value="Retailer">Retailer</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[150px]"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted py-3 px-4 text-sm font-medium">
              <div className="col-span-3 flex items-center">
                <span>Name</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>Location</span>
                </div>
              </div>
              <div className="col-span-1 text-center">Orders</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y">
              {filteredRetailers.map((retailer) => (
                <div
                  key={retailer.id}
                  className="grid grid-cols-12 items-center py-3 px-4"
                >
                  <div className="col-span-3 font-medium">{retailer.name}</div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        retailer.type === "Franchise"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {retailer.type}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <User className="mr-1 h-3 w-3 text-gray-500" />
                    <span>{retailer.owner}</span>
                  </div>
                  <div className="col-span-2 text-sm">{retailer.location}</div>
                  <div className="col-span-1 text-center">
                    {retailer.totalOrders}
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        retailer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : retailer.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {retailer.status.charAt(0).toUpperCase() +
                        retailer.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                      <span className="sr-only">View Details</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetailersManagement;
