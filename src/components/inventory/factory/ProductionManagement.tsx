"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, LineChart } from "@/components/inventory/shared/Charts";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Factory,
  FileBarChart,
  Plus,
  Settings,
  Zap,
} from "lucide-react";

// Mock data for production batches
const productionBatches = [
  {
    id: "B-2023-09-001",
    product: "Yachu Hair Oil - 100ml",
    quantity: 1200,
    startDate: "2023-09-15",
    endDate: "2023-09-16",
    status: "completed",
    efficiency: 98,
  },
  {
    id: "B-2023-09-002",
    product: "Yachu Hair Oil - 200ml",
    quantity: 800,
    startDate: "2023-09-16",
    endDate: "2023-09-17",
    status: "completed",
    efficiency: 95,
  },
  {
    id: "B-2023-09-003",
    product: "Yachu Hair Oil - 100ml",
    quantity: 1500,
    startDate: "2023-09-18",
    endDate: "2023-09-19",
    status: "in-progress",
    efficiency: 92,
  },
  {
    id: "B-2023-09-004",
    product: "Yachu Hair Oil - 50ml",
    quantity: 2000,
    startDate: "2023-09-20",
    endDate: "2023-09-21",
    status: "scheduled",
    efficiency: null,
  },
];

const ProductionManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Production Management</h2>
          <p className="text-muted-foreground">
            Schedule and monitor production batches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Settings className="mr-2 h-4 w-4" />
            Production Settings
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Production
            </CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150 units</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Batches
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              3 scheduled for this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Batches
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Production Schedule</CardTitle>
            <CardDescription>
              Current and upcoming production batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 bg-muted py-3 px-4 text-sm font-medium">
                <div className="col-span-3">Batch ID</div>
                <div className="col-span-3">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Dates</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              <div className="divide-y">
                {productionBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="grid grid-cols-12 items-center py-3 px-4"
                  >
                    <div className="col-span-3 font-medium">{batch.id}</div>
                    <div className="col-span-3">{batch.product}</div>
                    <div className="col-span-2 text-center">
                      {batch.quantity}
                    </div>
                    <div className="col-span-2 text-center flex flex-col">
                      <span className="text-xs flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {batch.startDate}
                      </span>
                      <span className="text-xs flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {batch.endDate}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          batch.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : batch.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {batch.status === "completed" && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {batch.status === "in-progress" && (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {batch.status === "scheduled" && (
                          <Calendar className="mr-1 h-3 w-3" />
                        )}
                        {batch.status
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Metrics</CardTitle>
            <CardDescription>Monthly production analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Production by Product Size
              </h4>
              <div className="h-48">
                <BarChart large />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Efficiency Trend</h4>
              <div className="h-48">
                <LineChart large />
              </div>
            </div>

            <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <FileBarChart className="mr-2 h-4 w-4" />
              View Detailed Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionManagement;
