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
    !!oilBottleOnly;

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
  };

  return (
    <Dialog open={open} onOpenChange={setShowExportModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
          <DialogDescription>
            {userRole === "Franchise"
              ? "Select a date range to export Franchise sales summary as CSV."
              : "The Processing data will only export as a CSV."}
          </DialogDescription>
        </DialogHeader>
        {userRole === "Franchise" && (
          <>
            <div className="mb-4">
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
                <Label htmlFor="totalAmountMin">Total Amount Min</Label>
                <Input
                  id="totalAmountMin"
                  type="number"
                  placeholder="e.g. 500"
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
                <Label htmlFor="totalAmountMax">Total Amount Max</Label>
                <Input
                  id="totalAmountMax"
                  type="number"
                  placeholder="e.g. 2000"
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
                <Label htmlFor="productsCountMin">Products Count Min</Label>
                <Input
                  id="productsCountMin"
                  type="number"
                  placeholder="e.g. 1"
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
                <Label htmlFor="productsCountMax">Products Count Max</Label>
                <Input
                  id="productsCountMax"
                  type="number"
                  placeholder="e.g. 5"
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
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="moreThan3Products"
                  checked={!!moreThan3Products}
                  onCheckedChange={(checked) =>
                    setMoreThan3Products?.(checked ? true : undefined)
                  }
                />
                <Label htmlFor="moreThan3Products">More than 3 products</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="multipleOrdersCustomer"
                  checked={!!multipleOrdersCustomer}
                  onCheckedChange={(checked) =>
                    setMultipleOrdersCustomer?.(checked ? true : undefined)
                  }
                />
                <Label htmlFor="multipleOrdersCustomer">
                  Multiple orders by same customer
                </Label>
              </div>
              <div>
                <Label htmlFor="oilBottleTotalMin">
                  Oil bottle total quantity min
                </Label>
                <Input
                  id="oilBottleTotalMin"
                  type="number"
                  placeholder="e.g. 2"
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
          </>
        )}
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
