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
  Download,
  FileText,
  Package,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import { BarChart, LineChart } from "@/components/inventory/shared/Charts";

// Mock data for sales
const salesData = [
  {
    id: "S-2023-001",
    product: "Yachu Hair Oil - 100ml",
    quantity: 5,
    price: 300,
    total: 1500,
    customer: "Walk-in Customer",
    date: "2023-09-18",
    time: "14:30",
  },
  {
    id: "S-2023-002",
    product: "Yachu Hair Oil - 200ml",
    quantity: 2,
    price: 550,
    total: 1100,
    customer: "Ramesh Thapa",
    date: "2023-09-18",
    time: "11:45",
  },
  {
    id: "S-2023-003",
    product: "Yachu Hair Oil - 50ml",
    quantity: 3,
    price: 180,
    total: 540,
    customer: "Sita Sharma",
    date: "2023-09-17",
    time: "16:20",
  },
  {
    id: "S-2023-004",
    product: "Yachu Hair Oil - 100ml",
    quantity: 4,
    price: 300,
    total: 1200,
    customer: "Hari Bahadur",
    date: "2023-09-17",
    time: "10:15",
  },
  {
    id: "S-2023-005",
    product: "Yachu Hair Oil - Premium - 100ml",
    quantity: 2,
    price: 450,
    total: 900,
    customer: "Gita Rai",
    date: "2023-09-16",
    time: "15:40",
  },
  {
    id: "S-2023-006",
    product: "Yachu Hair Oil - 500ml",
    quantity: 1,
    price: 1200,
    total: 1200,
    customer: "Bikash Limbu",
    date: "2023-09-16",
    time: "12:30",
  },
  {
    id: "S-2023-007",
    product: "Yachu Hair Oil - 100ml",
    quantity: 3,
    price: 300,
    total: 900,
    customer: "Walk-in Customer",
    date: "2023-09-15",
    time: "17:10",
  },
];

const SalesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  // Filter sales based on search term and date filter
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? sale.date === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  // Calculate total sales
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  // Get unique dates for filter
  const uniqueDates = Array.from(new Set(salesData.map((sale) => sale.date)))
    .sort()
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Management</h2>
          <p className="text-muted-foreground">
            Track and analyze your sales data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <FileText className="mr-2 h-4 w-4" />
            New Sale
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems} units</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {filteredSales.length > 0
                ? Math.round(totalSales / filteredSales.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <User className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>Recent sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by product, ID, or customer..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
                value={dateFilter || ""}
                onChange={(e) => setDateFilter(e.target.value || null)}
              >
                <option value="">All Dates</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted py-3 px-4 text-sm font-medium">
                <div className="col-span-2 flex items-center">
                  <span>Sale ID</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
                <div className="col-span-3">Product</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-1 text-center">Price</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>Date & Time</span>
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {filteredSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="grid grid-cols-12 items-center py-3 px-4"
                  >
                    <div className="col-span-2 font-medium">{sale.id}</div>
                    <div className="col-span-3 flex items-center">
                      <Package className="mr-2 h-4 w-4 text-purple-600" />
                      <span>{sale.product}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      {sale.quantity}
                    </div>
                    <div className="col-span-1 text-center">₹{sale.price}</div>
                    <div className="col-span-1 text-center font-medium">
                      ₹{sale.total}
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3 text-gray-500" />
                        <span>{sale.customer}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm">
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {sale.date}
                        </span>
                        <span className="text-muted-foreground">
                          {sale.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Sales by Product</h4>
              <div className="h-48">
                <BarChart large />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Daily Sales Trend</h4>
              <div className="h-48">
                <LineChart large />
              </div>
            </div>

            <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <FileText className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesManagement;
