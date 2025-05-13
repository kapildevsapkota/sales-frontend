"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "@/components/ui/date-range-picker";
import axios from "axios";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import type { SalesResponse } from "@/types/sale";

interface SearchBarProps {
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onSearchResults: (results: SalesResponse) => void;
}

export function SearchBar({
  searchInput,
  handleSearchInputChange,
  clearSearch,
  paymentMethod,
  setPaymentMethod,
  orderStatus,
  setOrderStatus,
  dateRange,
  setDateRange,
  onSearchResults,
}: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Handle search with backend API
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a timeout to avoid making too many requests while typing
    searchTimeout.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const token = localStorage.getItem("accessToken");

        // Build query parameters
        const queryParams = new URLSearchParams();

        // Add search parameter if there's a search input
        if (searchInput && searchInput.length >= 2) {
          queryParams.append("search", searchInput);
        }

        // Add payment method filter if selected
        if (paymentMethod && paymentMethod !== "all") {
          queryParams.append("payment_method", paymentMethod);
        }

        // Add order status filter if selected
        if (orderStatus && orderStatus !== "all") {
          queryParams.append("order_status", orderStatus);
        }

        // Add date range parameters if selected
        if (dateRange?.from) {
          // Format start date correctly with no timezone shifting
          const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          const startDate = new Date(dateRange.from);
          queryParams.append("start_date", formatDate(startDate));
        }

        if (dateRange?.to) {
          // Format end date correctly with no timezone shifting
          const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          const endDate = new Date(dateRange.to);
          queryParams.append("end_date", formatDate(endDate));
        }

        // Make API call to backend with search and filter parameters
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }api/sales/orders/?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Pass search results to parent component
        onSearchResults(response.data);
      } catch (error) {
        console.error("Error searching orders:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    // Cleanup function
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput, paymentMethod, orderStatus, dateRange, onSearchResults]);

  // Function to get order status color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Pending":
        return "bg-yellow-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by name or phone number..."
          className="pl-10 pr-10 h-10 w-full rounded-md border border-gray-300"
          value={searchInput}
          onChange={handleSearchInputChange}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Payment Method Dropdown */}
      <div className="w-full md:w-48">
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Methods</SelectItem>
            <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
            <SelectItem value="Prepaid">Prepaid</SelectItem>
            <SelectItem value="Office Visit">Office Visit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Picker */}
      <div className="w-full md:w-auto">
        <DateRangePicker
          className="w-full"
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Order Status Dropdown - Only show for Distributor role */}
      {user?.role === "Distributor" && (
        <div className="w-full md:w-48">
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">
                <span
                  className={`${getOrderStatusColor(
                    "Pending"
                  )} rounded-full w-4 h-4 inline-block mr-2`}
                ></span>
                Pending
              </SelectItem>
              <SelectItem value="Delivered">
                <span
                  className={`${getOrderStatusColor(
                    "Delivered"
                  )} rounded-full w-4 h-4 inline-block mr-2`}
                ></span>
                Delivered
              </SelectItem>
              <SelectItem value="Cancelled">
                <span
                  className={`${getOrderStatusColor(
                    "Cancelled"
                  )} rounded-full w-4 h-4 inline-block mr-2`}
                ></span>
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
