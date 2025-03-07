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
  Calendar,
  Check,
  Clock,
  FileText,
  Package,
  Search,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";

// Mock data for order requests
const orderRequests = [
  {
    id: "OR-2023-001",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 20 },
      { name: "Yachu Hair Oil - 200ml", quantity: 15 },
    ],
    totalItems: 35,
    status: "pending",
    requestDate: "2023-09-18",
    expectedDelivery: "2023-09-25",
    notes: "Regular monthly stock replenishment",
  },
  {
    id: "OR-2023-002",
    products: [{ name: "Yachu Hair Oil - Premium - 100ml", quantity: 10 }],
    totalItems: 10,
    status: "approved",
    requestDate: "2023-09-15",
    expectedDelivery: "2023-09-22",
    notes: "New premium product stock",
  },
  {
    id: "OR-2023-003",
    products: [
      { name: "Yachu Hair Oil - 50ml", quantity: 30 },
      { name: "Yachu Hair Oil - 100ml", quantity: 25 },
    ],
    totalItems: 55,
    status: "in-transit",
    requestDate: "2023-09-10",
    expectedDelivery: "2023-09-17",
    notes: "Urgent restock for festival season",
  },
  {
    id: "OR-2023-004",
    products: [{ name: "Yachu Hair Oil - 500ml", quantity: 5 }],
    totalItems: 5,
    status: "delivered",
    requestDate: "2023-09-05",
    deliveryDate: "2023-09-12",
    notes: "Special order for bulk size",
  },
  {
    id: "OR-2023-005",
    products: [
      { name: "Yachu Hair Oil - 100ml", quantity: 15 },
      { name: "Yachu Hair Oil - 200ml", quantity: 10 },
      { name: "Yachu Hair Oil - 50ml", quantity: 20 },
    ],
    totalItems: 45,
    status: "delivered",
    requestDate: "2023-08-28",
    deliveryDate: "2023-09-04",
    notes: "Monthly inventory replenishment",
  },
];

const OrderRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter orders based on search term and status filter
  const filteredOrders = orderRequests.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (order.notes &&
        order.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Count orders by status
  const pendingCount = orderRequests.filter(
    (order) => order.status === "pending"
  ).length;
  const approvedCount = orderRequests.filter(
    (order) => order.status === "approved"
  ).length;
  const inTransitCount = orderRequests.filter(
    (order) => order.status === "in-transit"
  ).length;
  const deliveredCount = orderRequests.filter(
    (order) => order.status === "delivered"
  ).length;

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "";
    let icon = null;

    switch (status) {
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        icon = <Clock className="mr-1 h-3 w-3" />;
        break;
      case "approved":
        bgColor = "bg-blue-100 text-blue-800";
        icon = <Check className="mr-1 h-3 w-3" />;
        break;
      case "in-transit":
        bgColor = "bg-purple-100 text-purple-800";
        icon = <Truck className="mr-1 h-3 w-3" />;
        break;
      case "delivered":
        bgColor = "bg-green-100 text-green-800";
        icon = <Package className="mr-1 h-3 w-3" />;
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Order Requests</h2>
          <p className="text-muted-foreground">
            Manage your stock order requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <FileText className="mr-2 h-4 w-4" />
            Order History
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Order Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={pendingCount > 0 ? "border-yellow-300" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className={approvedCount > 0 ? "border-blue-300" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Ready for shipment</p>
          </CardContent>
        </Card>

        <Card className={inTransitCount > 0 ? "border-purple-300" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitCount}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card className={deliveredCount > 0 ? "border-green-300" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-muted-foreground">Received orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Requests</CardTitle>
          <CardDescription>Manage your stock order requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, product, or notes..."
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
              <option value="approved">Approved</option>
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
              <div className="col-span-3">Products</div>
              <div className="col-span-1 text-center">Items</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>Request Date</span>
                </div>
              </div>
              <div className="col-span-2">Expected Delivery</div>
            </div>

            <div className="divide-y">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 items-center py-3 px-4"
                >
                  <div className="col-span-2 font-medium">{order.id}</div>
                  <div className="col-span-3">
                    <div className="flex flex-col">
                      {order.products.map((product, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Package className="mr-1 h-3 w-3 text-purple-600" />
                          <span>
                            {product.name} (x{product.quantity})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 text-center">
                    {order.totalItems}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="col-span-2 text-sm">{order.requestDate}</div>
                  <div className="col-span-2 text-sm">
                    {order.status === "delivered"
                      ? order.deliveryDate
                      : order.expectedDelivery}
                    {order.status === "delivered" && (
                      <span className="ml-2 text-xs text-green-600">
                        (Delivered)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No order requests found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order Request</CardTitle>
            <CardDescription>
              Request new stock from distributor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                  Select Products
                </label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select a product</option>
                  <option value="yachu-100ml">Yachu Hair Oil - 100ml</option>
                  <option value="yachu-200ml">Yachu Hair Oil - 200ml</option>
                  <option value="yachu-50ml">Yachu Hair Oil - 50ml</option>
                  <option value="yachu-500ml">Yachu Hair Oil - 500ml</option>
                  <option value="yachu-premium-100ml">
                    Yachu Hair Oil - Premium - 100ml
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Add any special instructions or notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Order
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
            <CardDescription>Track your recent orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orderRequests
                .filter(
                  (order) =>
                    order.status === "in-transit" || order.status === "approved"
                )
                .slice(0, 2)
                .map((order) => (
                  <div key={order.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{order.id}</h4>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Package className="mr-1 h-3 w-3" />
                        <span>{order.totalItems} items</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Expected: {order.expectedDelivery}</span>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                            {order.status === "in-transit"
                              ? "On the way"
                              : "Processing"}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                          style={{
                            width:
                              order.status === "in-transit" ? "75%" : "25%",
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                      </div>
                      <div className="flex text-xs justify-between">
                        <span>Approved</span>
                        <span>In Transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                ))}

              {orderRequests.filter(
                (order) =>
                  order.status === "in-transit" || order.status === "approved"
              ).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No orders currently in transit
                  </p>
                </div>
              )}

              <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                <Truck className="mr-2 h-4 w-4" />
                View All Tracked Orders
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderRequests;
