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
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Plus,
  Search,
  Truck,
} from "lucide-react";

// Mock data for orders
const orders = [
  {
    id: "ORD-2023-001",
    retailer: "Kathmandu Central Store",
    type: "Franchise",
    location: "Thamel, Kathmandu",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 50 },
      { name: "Yachu Hair Oil - 200ml", quantity: 30 },
    ],
    totalItems: 80,
    totalAmount: 20500,
    status: "delivered",
    orderDate: "2023-09-10",
    deliveryDate: "2023-09-12",
  },
  {
    id: "ORD-2023-002",
    retailer: "Pokhara Beauty Shop",
    type: "Franchise",
    location: "Lakeside, Pokhara",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 40 },
      { name: "Yachu Hair Oil - 50ml", quantity: 50 },
    ],
    totalItems: 90,
    totalAmount: 17500,
    status: "in-transit",
    orderDate: "2023-09-15",
    deliveryDate: "2023-09-18",
  },
  {
    id: "ORD-2023-003",
    retailer: "Lalitpur Cosmetics",
    type: "Retailer",
    location: "Patan, Lalitpur",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 30 },
      { name: "Yachu Hair Oil - 200ml", quantity: 20 },
      { name: "Yachu Hair Oil - 500ml", quantity: 10 },
    ],
    totalItems: 60,
    totalAmount: 24500,
    status: "processing",
    orderDate: "2023-09-17",
    deliveryDate: "2023-09-20",
  },
  {
    id: "ORD-2023-004",
    retailer: "Bhaktapur Beauty Center",
    type: "Retailer",
    location: "Durbar Square, Bhaktapur",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 20 },
      { name: "Yachu Hair Oil - 50ml", quantity: 30 },
    ],
    totalItems: 50,
    totalAmount: 9500,
    status: "pending",
    orderDate: "2023-09-18",
    deliveryDate: "2023-09-22",
  },
  {
    id: "ORD-2023-005",
    retailer: "Kathmandu Central Store",
    type: "Franchise",
    location: "Thamel, Kathmandu",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 60 },
      { name: "Yachu Hair Oil - 200ml", quantity: 40 },
      { name: "Yachu Hair Oil - 50ml", quantity: 50 },
    ],
    totalItems: 150,
    totalAmount: 35000,
    status: "pending",
    orderDate: "2023-09-19",
    deliveryDate: "2023-09-23",
  },
];

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <p className="text-muted-foreground">
            Manage orders from retailers and franchises
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "processing").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Being prepared for delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "in-transit").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            View and manage orders from retailers and franchises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, retailer, or location..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted py-3 px-4 text-sm font-medium">
              <div className="col-span-2 flex items-center">
                <span>Order ID</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
              <div className="col-span-2">Retailer</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>Location</span>
                </div>
              </div>
              <div className="col-span-1 text-center">Items</div>
              <div className="col-span-1 text-center">Amount (₹)</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 items-center py-3 px-4"
                >
                  <div className="col-span-2 font-medium">{order.id}</div>
                  <div className="col-span-2">{order.retailer}</div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        order.type === "Franchise"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {order.type}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm">{order.location}</div>
                  <div className="col-span-1 text-center">
                    {order.totalItems}
                  </div>
                  <div className="col-span-1 text-center">
                    {order.totalAmount}
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "in-transit"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "processing"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status === "delivered" && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {order.status === "in-transit" && (
                        <Truck className="mr-1 h-3 w-3" />
                      )}
                      {order.status === "processing" && (
                        <Package className="mr-1 h-3 w-3" />
                      )}
                      {order.status === "pending" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {order.status
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
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

export default OrdersManagement;
