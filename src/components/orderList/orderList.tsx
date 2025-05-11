"use client";

import type React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Search,
  ChevronDown,
  Eye,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
} from "lucide-react";
import type {
  SaleItem,
  SalesResponse,
  Column,
  SortDirection,
} from "@/types/sale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function SalesTable() {
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [displayData, setDisplayData] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterTerm, setFilterTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [, setShowSortDropdown] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [dateRange, setDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string>("");
  const router = useRouter();

  const [columns, setColumns] = useState<Column[]>([
    { id: "index", label: "#", visible: true, width: 50, sortable: true },
    {
      id: "timestamp",
      label: "Timestamp",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "full_name",
      label: "Full Name",
      visible: true,
      width: 150,
      sortable: true,
    },
    {
      id: "delivery_location",
      label: "Delivery Location",
      visible: true,
      width: 180,
      sortable: true,
    },
    {
      id: "phone_number",
      label: "Phone number",
      visible: true,
      width: 130,
      sortable: true,
    },
    {
      id: "oil_type",
      label: "Oil Type",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "quantity",
      label: "Quantity",
      visible: true,
      width: 80,
      sortable: true,
    },
    {
      id: "total_amount",
      label: "Total amount",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "remaining_amount",
      label: "Remaining Amount",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "payment_method",
      label: "Payment method",
      visible: true,
      width: 150,
      sortable: true,
    },
    {
      id: "send_order",
      label: "Send Order",
      visible: true,
      width: 120,
      sortable: false,
    },
    {
      id: "edit",
      label: "Edit",
      visible: true,
      width: 100,
      sortable: false,
    },
    {
      id: "remarks",
      label: "Remarks [If Any]",
      visible: false,
      width: 150,
      sortable: true,
    },
    {
      id: "convinced_by",
      label: "Convinced by",
      visible: false,
      width: 120,
      sortable: true,
    },
    {
      id: "amount_paid",
      label: "Amount Paid",
      visible: false,
      width: 120,
      sortable: true,
    },
    {
      id: "delivery_charge",
      label: "Delivery Charge",
      visible: false,
      width: 150,
      sortable: true,
    },
    {
      id: "remaining",
      label: "Remaining",
      visible: false,
      width: 120,
      sortable: true,
    },
  ]);

  // Function to show error messages
  const showError = useCallback((message: string) => {
    console.error(message);
    // You can implement a toast notification here
  }, []);

  // Function to apply filters to the data
  const applyFilters = useCallback(
    (data: SaleItem[]) => {
      if (Object.keys(filters).length === 0 && !dateRange[0] && !dateRange[1])
        return data;

      return data.filter((item) => {
        // Apply date range filter
        if (dateRange[0] && dateRange[1]) {
          const saleDate = new Date(item.created_at);
          if (saleDate < dateRange[0] || saleDate > dateRange[1]) {
            return false;
          }
        }

        // Apply other filters
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;

          // Handle total amount range filtering
          if (key === "total_amount_min") {
            return Number(item.total_amount) >= Number(value);
          }
          if (key === "total_amount_max") {
            return Number(item.total_amount) <= Number(value);
          }

          // Handle oil type filtering
          if (key === "oil_type") {
            const oilType = item.order_products[0]?.product.name || "";
            return oilType.toLowerCase().includes(value.toLowerCase());
          }

          // Handle quantity filtering
          if (key === "quantity") {
            const quantity = item.order_products[0]?.quantity || 0;
            return quantity === Number(value);
          }

          // Handle status filtering
          if (key === "order_status") {
            return item.order_status === value;
          }

          // Handle other filters
          const itemValue = String(getValueByColumnId(item, key)).toLowerCase();
          return itemValue.includes(value.toLowerCase());
        });
      });
    },
    [filters, dateRange]
  );
  // Sort data function
  const sortData = useCallback(
    (data: SaleItem[], field: string | null, direction: SortDirection) => {
      if (!field || !direction) return data;

      return [...data].sort((a, b) => {
        let valueA = getValueByColumnId(a, field);
        let valueB = getValueByColumnId(b, field);

        // Handle numeric values
        if (typeof valueA === "number" && typeof valueB === "number") {
          return direction === "asc" ? valueA - valueB : valueB - valueA;
        }

        // Convert to string for comparison
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();

        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    },
    []
  );

  // Update the sorting effect
  useEffect(() => {
    if (sales?.results) {
      let dataToSort = [...sales.results];

      // Apply search filter if there's a search term
      if (searchInput && searchInput.length < 3) {
        dataToSort = dataToSort.filter((sale) => {
          const searchableFields = [
            sale.full_name,
            sale.delivery_address,
            sale.city,
            sale.phone_number,
            sale.remarks,
            sale.order_products[0]?.product.name,
            sale.payment_method,
            `${sale.sales_person.first_name} ${sale.sales_person.last_name}`,
            sale.total_amount.toString(),
          ];

          return searchableFields.some((field) =>
            field?.toLowerCase().includes(searchInput.toLowerCase())
          );
        });
      }

      // Apply filters
      const filtered = applyFilters(dataToSort);

      // Apply sorting
      const sorted = sortData(filtered, sortField, sortDirection);
      setDisplayData(sorted);
    }
  }, [sales, sortField, sortDirection, sortData, searchInput, applyFilters]);

  // Handle sort change
  const handleSort = (columnId: string) => {
    if (columnId === sortField) {
      // Toggle direction if same field
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // New field, set to ascending
      setSortField(columnId);
      setSortDirection("asc");
    }
  };

  // Fetch sales data from API
  const fetchSales = useCallback(
    async (page = 1, size: number = pageSize) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

        // Add sorting parameters to API request if supported by backend
        const url = `${
          process.env.NEXT_PUBLIC_API_URL
        }api/sales/orders/?page=${page}&page_size=${size}&search=${encodeURIComponent(
          filterTerm
        )}`;

        // Uncomment if your API supports sorting
        // if (sortField && sortDirection) {
        //   const sortParam = `${sortDirection === 'desc' ? '-' : ''}${sortField}`
        //   url += `&ordering=${sortParam}`
        // }

        const response = await axios.get<SalesResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSales(response.data);
        setCurrentPage(page);
        setPageSize(size);

        applyFilters(response.data.results || []);
      } catch {
        showError("Failed to fetch sales data");
      } finally {
        setIsLoading(false);
      }
    },
    [filterTerm, pageSize, applyFilters, showError]
  );

  // Update the handleGlobalSearch function
  const handleGlobalSearch = useCallback(
    (searchTerm: string) => {
      if (!sales?.results) return;

      const filtered = sales.results.filter((sale) => {
        const searchableFields = [
          sale.full_name,
          sale.delivery_address,
          sale.city,
          sale.phone_number,
          sale.remarks,
          sale.order_products[0]?.product.name,
          sale.payment_method,
          `${sale.sales_person.first_name} ${sale.sales_person.last_name}`,
          sale.total_amount.toString(),
        ];

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      setDisplayData(filtered);
    },
    [sales]
  );

  // Update the search input handler
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);

      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        if (value.length >= 3) {
          // If search term is 3 or more characters, fetch from API
          setFilterTerm(value);
          fetchSales(1);
        } else if (value.length === 0) {
          // If search is cleared, reset to original data
          setFilterTerm("");
          fetchSales(1);
        } else {
          // For 1-2 characters, just filter the current data
          handleGlobalSearch(value);
        }
      }, 300);
    },
    [fetchSales, handleGlobalSearch]
  );

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Show all columns
  const showAllColumns = () => {
    setColumns(columns.map((col) => ({ ...col, visible: true })));
  };

  // Hide all columns except the first one
  const hideAllColumns = () => {
    setColumns(columns.map((col) => ({ ...col, visible: col.id === "index" })));
  };

  // Column resize handlers
  const handleResizeStart = (
    e: React.MouseEvent,
    columnId: string,
    initialWidth: number
  ) => {
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(initialWidth);
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
    e.preventDefault();
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (resizingColumn) {
        const column = columns.find((col) => col.id === resizingColumn);
        if (column) {
          const newWidth = Math.max(50, startWidth + (e.clientX - startX));
          setColumns(
            columns.map((col) =>
              col.id === resizingColumn ? { ...col, width: newWidth } : col
            )
          );
        }
      }
    },
    [columns, resizingColumn, startWidth, startX]
  );

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    fetchSales(currentPage);
  }, [fetchSales, currentPage]);

  // Add this helper function at the top level of your component
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    return `${day}/${month}/${year}`; // Format as dd/mm/yy
  };

  // Function to get color based on order status
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500"; // Green for delivered
      case "Pending":
        return "bg-yellow-500"; // Yellow for pending
      case "Cancelled":
        return "bg-red-500"; // Red for cancelled
      default:
        return "bg-gray-500"; // Default color
    }
  };

  // Add this function to handle sending order to WhatsApp
  const handleSendOrder = (sale: SaleItem) => {
    // Format the order details
    const orderDetails = `
*New Order Alert!* 🚀

*Customer Details:*
👤 Name: ${sale.full_name}
📱 Phone: ${sale.phone_number}
📍 Location: ${sale.delivery_address}, ${sale.city}

*Order Details:*
🛒 Products: ${sale.order_products
      .map((p) => `${p.product.name} - ${p.quantity}`)
      .join(", ")}
💰 Total Amount: Rs. ${sale.total_amount}
${
  sale.payment_method === "Prepaid"
    ? `💳 Prepaid Amount: Rs. ${sale.prepaid_amount || 0}
💰 Remaining Amount: Rs. ${
        Number(sale.total_amount) - (sale.prepaid_amount || 0)
      }`
    : ""
}

💳 Payment Method: ${sale.payment_method}
📝 Remarks: ${sale.remarks || "None"}

*Sales Person:*
👨‍💼 ${sale.sales_person.first_name} ${sale.sales_person.last_name}

Please process this order promptly! 🚀
    `.trim();

    // Copy to clipboard
    navigator.clipboard
      .writeText(orderDetails)
      .then(() => {
        // Show success message
        alert(
          "Order details copied to clipboard! Please paste it in your WhatsApp group."
        );
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy order details. Please try again.");
      });
  };

  // Add this function to handle edit
  const handleEdit = (sale: SaleItem) => {
    router.push(`/sales/orders/edit/${sale.id}`);
  };

  // Update the getValueByColumnId function to include the edit case
  const getValueByColumnId = (sale: SaleItem, columnId: string) => {
    switch (columnId) {
      case "index":
        return "";
      case "timestamp":
        return formatTimestamp(sale.created_at);
      case "full_name":
        return sale.full_name;
      case "delivery_location":
        return `${sale.delivery_address}, ${sale.city}`;
      case "phone_number":
        return sale.phone_number;
      case "remarks":
        return sale.remarks;
      case "oil_type":
        return sale.order_products
          .map((product) => `${product.product.name} - ${product.quantity}`)
          .join(", ");
      case "quantity":
        let quantity = 0;
        sale.order_products.forEach((product) => {
          quantity += product.quantity;
        });
        return quantity;
      case "total_amount":
        return Number.parseFloat(sale.total_amount);
      case "remaining_amount":
        const total = Number.parseFloat(sale.total_amount);
        const prepaid = sale.prepaid_amount ?? 0;
        return total - prepaid;
      case "convinced_by":
        return `${sale.sales_person.first_name} ${sale.sales_person.last_name}`;
      case "payment_method":
        return (
          <div className="flex items-center gap-2">
            <span>
              {sale.payment_method}
              {sale.payment_method === "Prepaid" && sale.prepaid_amount && (
                <span className="ml-1 text-sm text-gray-500">
                  (Rs. {sale.prepaid_amount})
                </span>
              )}
            </span>
            {(sale.payment_method === "Prepaid" ||
              sale.payment_method === "Office Visit") &&
              sale.payment_screenshot && (
                <Eye
                  className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPaymentImage(sale.payment_screenshot);
                    setShowPaymentImageModal(true);
                  }}
                />
              )}
          </div>
        );
      case "delivery_charge":
        return Number.parseFloat(sale.delivery_charge);
      case "order_status":
        return (
          <span
            className={
              getOrderStatusColor(sale.order_status) +
              " text-white rounded-full w-4 h-4 mr-2"
            }
          >
            {/* Color indicator */}
          </span>
        );
      case "send_order":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendOrder(sale)}
            className="flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Send Order
          </Button>
        );
      case "edit":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(sale)}
            className="flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Button>
        );
      default:
        return "";
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (columnId: string) => {
    if (sortField !== columnId)
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
  };

  const handleAdvancedFilter = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add date range filters if selected
      if (dateRange[0] && dateRange[1]) {
        queryParams.append(
          "start_date",
          dateRange[0].toISOString().split("T")[0]
        );
        queryParams.append(
          "end_date",
          dateRange[1].toISOString().split("T")[0]
        );
      }

      // Add status filter if selected
      if (filters["order_status"]) {
        queryParams.append("order_status", filters["order_status"]);
      }

      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "order_status") {
          queryParams.append(key, value);
        }
      });

      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }api/sales/orders/?${queryParams.toString()}`;

      const response = await axios.get<SalesResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSales(response.data);
      setCurrentPage(1);
      setDisplayData(response.data.results || []); // Update displayData with filtered results
    } catch (error) {
      console.error("Error applying filters:", error);
      showError("Failed to apply filters");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle status change
  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${process.env.NEXT_PUBLIC_API_URL}api/sales/orders/${saleId}/`;

      await axios.patch(
        url,
        { order_status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optionally, refetch sales data or update local state
      fetchSales(currentPage);
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Failed to update order status");
    }
  };

  // Function to handle CSV export
  const handleExportCSV = async () => {
    try {
      if (!exportDateRange[0]) {
        alert("Please select a start date.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      const startDate = exportDateRange[0].toISOString().split("T")[0];
      const endDate = exportDateRange[1]
        ? exportDateRange[1].toISOString().split("T")[0]
        : "";

      const url = `https://sales.baliyoventures.com/api/sales/export-csv/?start_date=${startDate}${
        endDate ? `&end_date=${endDate}` : ""
      }`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for downloading files
      });

      // Create a link element to trigger the download
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlObject;
      link.setAttribute("download", `sales_${startDate}_${endDate || ""}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="container-fluid px-2 py-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-normal">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <div className="flex justify-between p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showAllColumns}
                    className="w-[48%]"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={hideAllColumns}
                    className="w-[48%]"
                  >
                    <EyeOff className="mr-1 h-4 w-4" />
                    None
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              {sales?.results.length
                ? `${sales.results.length} of ${sales.count} entries`
                : ""}
            </div>
          </div>

          <div className="relative w-full md:max-w-xl">
            <div className="flex flex-col md:flex-row items-center gap-2 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search sales..."
                  className="pl-10 pr-10 h-10 w-full rounded-md border border-gray-300"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => {
                      setSearchInput("");
                      setFilterTerm("");
                      fetchSales(1);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap w-full md:w-auto"
                onClick={() => setShowFilterForm(!showFilterForm)}
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>

            {showFilterForm && (
              <div className="absolute z-20 left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Advanced Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowFilterForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex gap-2">
                      <DatePicker
                        selected={dateRange[0]}
                        onChange={(date) =>
                          setDateRange([date || undefined, dateRange[1]])
                        }
                        selectsStart
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        placeholderText="Start Date"
                        className="w-full p-2 border rounded-md"
                      />
                      <DatePicker
                        selected={dateRange[1]}
                        onChange={(date) =>
                          setDateRange([dateRange[0], date || undefined])
                        }
                        selectsEnd
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        minDate={dateRange[0]}
                        placeholderText="End Date"
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>

                  {/* Add Status Filter */}
                  <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm font-medium">Order Status</label>
                    <Select
                      value={filters["order_status"] || ""}
                      onValueChange={(value) => {
                        setFilters((prev) => ({
                          ...prev,
                          order_status: value,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {columns
                    .filter(
                      (col) =>
                        col.visible &&
                        col.id !== "index" &&
                        col.id !== "timestamp" &&
                        col.id !== "full_name" &&
                        col.id !== "phone_number" &&
                        col.id !== "delivery_location" &&
                        col.id !== "total_amount" &&
                        col.id !== "payment_method" &&
                        col.id !== "order_status" &&
                        col.id !== "quantity"
                    )
                    .map((column) => (
                      <div
                        key={column.id}
                        className="grid grid-cols-[120px_1fr] gap-2 items-center"
                      >
                        <label
                          htmlFor={`filter-${column.id}`}
                          className="text-sm font-medium"
                        >
                          {column.label}
                        </label>
                        <Input
                          id={`filter-${column.id}`}
                          placeholder={`Filter by ${column.label.toLowerCase()}`}
                          value={filters[column.id] || ""}
                          onChange={(e) => {
                            setFilters((prev) => ({
                              ...prev,
                              [column.id]: e.target.value,
                            }));
                          }}
                        />
                      </div>
                    ))}

                  {/* Add Total Amount Range Filter */}
                  <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm font-medium">
                      Total Amount Range
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters["total_amount_min"] || ""}
                        onChange={(e) => {
                          setFilters((prev) => ({
                            ...prev,
                            total_amount_min: e.target.value,
                          }));
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters["total_amount_max"] || ""}
                        onChange={(e) => {
                          setFilters((prev) => ({
                            ...prev,
                            total_amount_max: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({});
                      setDateRange([undefined, undefined]);
                      fetchSales(1);
                      setShowFilterForm(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={() => {
                      handleAdvancedFilter();
                      setShowFilterForm(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export CSV Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-normal">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => setShowExportModal(true)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Export CSV Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Export CSV</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowExportModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <DatePicker
                    selected={exportDateRange[0]}
                    onChange={(date) =>
                      setExportDateRange([
                        date || undefined,
                        exportDateRange[1],
                      ])
                    }
                    selectsStart
                    startDate={exportDateRange[0]}
                    endDate={exportDateRange[1]}
                    placeholderText="Start Date"
                    className="w-full p-2 border rounded-md"
                  />
                  <DatePicker
                    selected={exportDateRange[1]}
                    onChange={(date) =>
                      setExportDateRange([
                        exportDateRange[0],
                        date || undefined,
                      ])
                    }
                    selectsEnd
                    startDate={exportDateRange[0]}
                    endDate={exportDateRange[1]}
                    minDate={exportDateRange[0]}
                    placeholderText="End Date"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExportCSV}>Export</Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Image Modal */}
      {showPaymentImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payment Screenshot</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowPaymentImageModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={selectedPaymentImage}
                alt="Payment Screenshot"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-x-auto border rounded-md h-[calc(100vh-180px)]">
        <Table
          ref={tableRef}
          className="border-collapse whitespace-nowrap text-sm"
        >
          <TableHeader>
            <tr className="bg-gray-50">
              {columns
                .filter((col) => col.visible)
                .map((column) => (
                  <TableHead
                    key={column.id}
                    className={`border p-2 text-left relative  top-0 bg-white z-10 ${
                      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    style={{
                      width: `${column.width}px`,
                      minWidth: `${column.width}px`,
                    }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span className="flex items-center">
                          {getSortIcon(column.id)}
                        </span>
                      )}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize group"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, column.id, column.width);
                        }}
                      >
                        <div className="absolute right-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-400"></div>
                      </div>
                    </div>
                  </TableHead>
                ))}
            </tr>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <TableCell
                        key={`skeleton-cell-${index}-${column.id}`}
                        className="border p-2"
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                        }}
                      >
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : sales && displayData.length > 0 ? (
              displayData.map((sale, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "" : "bg-gray-50"}
                >
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <TableCell
                        key={`${index}-${column.id}`}
                        className="border p-2"
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                        }}
                      >
                        {column.id === "index" ? (
                          (currentPage - 1) * pageSize + index + 1
                        ) : column.id === "order_status" ? (
                          <div className="flex items-center">
                            <Select
                              value={sale.order_status}
                              onValueChange={(value) =>
                                handleStatusChange(String(sale.id), value)
                              }
                            >
                              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300">
                                <SelectValue placeholder="Change Status" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                                <SelectItem value="Pending">
                                  <span
                                    className={
                                      getOrderStatusColor("Pending") +
                                      " rounded-full w-4 h-4 inline-block mr-2"
                                    }
                                  ></span>
                                  Pending
                                </SelectItem>
                                <SelectItem value="Delivered">
                                  <span
                                    className={
                                      getOrderStatusColor("Delivered") +
                                      " rounded-full w-4 h-4 inline-block mr-2"
                                    }
                                  ></span>
                                  Delivered
                                </SelectItem>
                                <SelectItem value="Cancelled">
                                  <span
                                    className={
                                      getOrderStatusColor("Cancelled") +
                                      " rounded-full w-4 h-4 inline-block mr-2"
                                    }
                                  ></span>
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          getValueByColumnId(sale, column.id)
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.filter((col) => col.visible).length}
                  className="border p-2 text-center"
                >
                  No sales data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      {sales && (
        <div className="mt-4 flex flex-col md:flex-row justify-end items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Page {currentPage} of {Math.ceil((sales.count || 0) / pageSize)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentPage > 1 && fetchSales(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sales.next && fetchSales(currentPage + 1)}
              disabled={!sales.next}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
