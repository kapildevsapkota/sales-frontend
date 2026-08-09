"use client";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportModalProps {
  exportDateRange: [Date | undefined, Date | undefined];
  setExportDateRange: (dateRange: [Date | undefined, Date | undefined]) => void;
  handleExportCSV: () => void;
  setShowExportModal: (show: boolean) => void;
  open: boolean;
  userRole?: string;
  totalAmountMin?: number;
  setTotalAmountMin?: (value: number | undefined) => void;
  totalAmountMax?: number;
  setTotalAmountMax?: (value: number | undefined) => void;
  productsCountMin?: number;
  setProductsCountMin?: (value: number | undefined) => void;
  productsCountMax?: number;
  setProductsCountMax?: (value: number | undefined) => void;
  moreThan3Products?: boolean;
  setMoreThan3Products?: (value: boolean | undefined) => void;
  multipleOrdersCustomer?: boolean;
  setMultipleOrdersCustomer?: (value: boolean | undefined) => void;
  oilBottleTotalMin?: number;
  setOilBottleTotalMin?: (value: number | undefined) => void;
  oilBottleOnly?: boolean;
  setOilBottleOnly?: (value: boolean | undefined) => void;
  exportSearchInput?: string;
  setExportSearchInput?: (value: string) => void;
  exportPaymentMethod?: string;
  setExportPaymentMethod?: (value: string) => void;
  exportOrderStatus?: string;
  setExportOrderStatus?: (value: string) => void;
  exportDeliveryType?: string;
  setExportDeliveryType?: (value: string) => void;
  exportSalesperson?: string;
  setExportSalesperson?: (value: string) => void;
  exportLogistic?: string;
  setExportLogistic?: (value: string) => void;
  salespersons?: { id: number; first_name: string; last_name: string; }[];
}

export function ExportModal({
  exportDateRange,
  setExportDateRange,
  handleExportCSV,
  setShowExportModal,
  open,
  userRole,
  totalAmountMin,
  setTotalAmountMin,
  totalAmountMax,
  setTotalAmountMax,
  productsCountMin,
  setProductsCountMin,
  productsCountMax,
  setProductsCountMax,
  moreThan3Products,
  setMoreThan3Products,
  multipleOrdersCustomer,
  setMultipleOrdersCustomer,
  oilBottleTotalMin,
  setOilBottleTotalMin,
  oilBottleOnly,
  setOilBottleOnly,
  exportSearchInput,
  setExportSearchInput,
  exportPaymentMethod,
  setExportPaymentMethod,
  exportOrderStatus,
  setExportOrderStatus,
  exportDeliveryType,
  setExportDeliveryType,
  exportSalesperson,
  setExportSalesperson,
  exportLogistic,
  setExportLogistic,
  salespersons,
}: ExportModalProps) {
  // Convert [Date | undefined, Date | undefined] to DateRange for DateRangePicker
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: exportDateRange[0],
    to: exportDateRange[1],
  });

  const { user } = useAuth();
  console.log(user?.franchise_id);

  const handleDateRangeChange = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    setDateRange(range || {});
    setExportDateRange([range?.from, range?.to]);
  };

  const isAnyFilterActive =
    !!dateRange.from ||
    !!dateRange.to ||
    typeof totalAmountMin === "number" ||
    typeof totalAmountMax === "number" ||
    typeof productsCountMin === "number" ||
    typeof productsCountMax === "number" ||
    !!moreThan3Products ||
    !!multipleOrdersCustomer ||
    typeof oilBottleTotalMin === "number" ||
    !!oilBottleOnly ||
    !!exportSearchInput ||
    (exportPaymentMethod && exportPaymentMethod !== "all") ||
    (exportOrderStatus && exportOrderStatus !== "all") ||
    (exportDeliveryType && exportDeliveryType !== "all") ||
    (exportSalesperson && exportSalesperson !== "all") ||
    (exportLogistic && exportLogistic !== "all");

  const clearFilters = () => {
    // Clear date range
    setDateRange({});
    setExportDateRange([undefined, undefined]);

    // Clear numeric filters
    setTotalAmountMin?.(undefined);
    setTotalAmountMax?.(undefined);
    setProductsCountMin?.(undefined);
    setProductsCountMax?.(undefined);
    setOilBottleTotalMin?.(undefined);

    // Clear boolean filters
    setMoreThan3Products?.(undefined);
    setMultipleOrdersCustomer?.(undefined);
    setOilBottleOnly?.(undefined);

    // Clear table filters
    setExportSearchInput?.("");
    setExportPaymentMethod?.("all");
    setExportOrderStatus?.("all");
    setExportDeliveryType?.("all");
    setExportSalesperson?.("all");
    setExportLogistic?.("all");
  };

  return (
    <Dialog open={open} onOpenChange={setShowExportModal}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
          <DialogDescription>
            {userRole === "Franchise"
              ? "Select a date range and filters to export Franchise sales summary as CSV."
              : "Set filters to export sales as a CSV."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
          {/* Franchise Advanced section */}
          {userRole === "Franchise" && (
            <div className="space-y-3">
              <div className="font-semibold text-sm text-gray-700">Advanced Export Filters</div>
              <div className="mb-2">
                <Label className="text-xs text-gray-500 mb-1 block">Date Range</Label>
                <DateRangePicker
                  value={
                    dateRange.from || dateRange.to
                      ? { from: dateRange.from, to: dateRange.to }
                      : undefined
                  }
                  onChange={handleDateRangeChange}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="totalAmountMin" className="text-xs">Total Amount Min</Label>
                  <Input
                    id="totalAmountMin"
                    type="number"
                    placeholder="e.g. 500"
                    className="h-8 text-xs"
                    value={
                      typeof totalAmountMin === "number" ? totalAmountMin : ""
                    }
                    onChange={(e) =>
                      setTotalAmountMin?.(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="totalAmountMax" className="text-xs">Total Amount Max</Label>
                  <Input
                    id="totalAmountMax"
                    type="number"
                    placeholder="e.g. 2000"
                    className="h-8 text-xs"
                    value={
                      typeof totalAmountMax === "number" ? totalAmountMax : ""
                    }
                    onChange={(e) =>
                      setTotalAmountMax?.(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="productsCountMin" className="text-xs">Products Count Min</Label>
                  <Input
                    id="productsCountMin"
                    type="number"
                    placeholder="e.g. 1"
                    className="h-8 text-xs"
                    value={
                      typeof productsCountMin === "number" ? productsCountMin : ""
                    }
                    onChange={(e) =>
                      setProductsCountMin?.(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="productsCountMax" className="text-xs">Products Count Max</Label>
                  <Input
                    id="productsCountMax"
                    type="number"
                    placeholder="e.g. 5"
                    className="h-8 text-xs"
                    value={
                      typeof productsCountMax === "number" ? productsCountMax : ""
                    }
                    onChange={(e) =>
                      setProductsCountMax?.(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="oilBottleTotalMin" className="text-xs font-medium">
                    Oil bottle quantity min
                  </Label>
                  <Input
                    id="oilBottleTotalMin"
                    type="number"
                    placeholder="e.g. 2"
                    className="h-8 text-xs"
                    value={
                      typeof oilBottleTotalMin === "number"
                        ? oilBottleTotalMin
                        : ""
                    }
                    onChange={(e) =>
                      setOilBottleTotalMin?.(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="moreThan3Products"
                    checked={!!moreThan3Products}
                    onCheckedChange={(checked) =>
                      setMoreThan3Products?.(checked ? true : undefined)
                    }
                  />
                  <Label htmlFor="moreThan3Products" className="text-xs font-normal">More than 3 products</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multipleOrdersCustomer"
                    checked={!!multipleOrdersCustomer}
                    onCheckedChange={(checked) =>
                      setMultipleOrdersCustomer?.(checked ? true : undefined)
                    }
                  />
                  <Label htmlFor="multipleOrdersCustomer" className="text-xs font-normal">
                    Multiple orders same customer
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oilBottleOnly"
                    checked={!!oilBottleOnly}
                    onCheckedChange={(checked) =>
                      setOilBottleOnly?.(checked ? true : undefined)
                    }
                  />
                  <Label htmlFor="oilBottleOnly" className="text-xs font-normal">
                    Oil Bottle Only
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Table Filters Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="font-semibold text-sm text-gray-700">Applied Table Filters</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exportSearchInput" className="text-xs">Search Sales</Label>
                <Input
                  id="exportSearchInput"
                  type="text"
                  placeholder="Search sales..."
                  className="h-8 text-xs"
                  value={exportSearchInput || ""}
                  onChange={(e) => setExportSearchInput?.(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Payment Method</Label>
                <Select value={exportPaymentMethod} onValueChange={setExportPaymentMethod}>
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="Cash on Delivery">Cash</SelectItem>
                    <SelectItem value="Prepaid">Prepaid</SelectItem>
                    <SelectItem value="Office Visit">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Order Status</Label>
                <Select value={exportOrderStatus} onValueChange={setExportOrderStatus}>
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Sent to Dash">Sent to Dash</SelectItem>
                    <SelectItem value="Sent to Daraz">Sent to Daraz</SelectItem>
                    <SelectItem value="Indrive">Indrive</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Returned By Customer">Returned By Customer</SelectItem>
                    <SelectItem value="Sent to YDM">Sent to YDM</SelectItem>
                    <SelectItem value="Sent to Dash">InDrive</SelectItem>
                    <SelectItem value="Out For Delivery">Out For Delivery</SelectItem>
                    <SelectItem value="Returned By YDM">Returned By YDM</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Returned By Dash">Returned By Dash</SelectItem>
                    <SelectItem value="Returned By Daraz">Returned By Daraz</SelectItem>
                    <SelectItem value="Return Pending">Return Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Delivery Type</Label>
                <Select value={exportDeliveryType} onValueChange={setExportDeliveryType}>
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Delivery</SelectItem>
                    <SelectItem value="Inside valley">Inside</SelectItem>
                    <SelectItem value="Outside valley">Outside</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Salesperson</Label>
                <Select value={exportSalesperson} onValueChange={setExportSalesperson}>
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Salespersons</SelectItem>
                    {salespersons?.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {`${person.first_name} ${person.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Logistics</Label>
                <Select value={exportLogistic} onValueChange={setExportLogistic}>
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Logistics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Logistics</SelectItem>
                    <SelectItem value="YDM">YDM</SelectItem>
                    <SelectItem value="DASH">DASH</SelectItem>
                    <SelectItem value="NCM">NCM</SelectItem>
                    <SelectItem value="PicknDrop">PicknDrop</SelectItem>
                    <SelectItem value="Daraz">Daraz</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {isAnyFilterActive && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleExportCSV}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
