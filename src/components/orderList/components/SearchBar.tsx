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
import axios from "axios";

// Add import for SalesResponse type at the top of the file
import type { SalesResponse } from "@/types/sale";

interface SearchBarProps {
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onSearchResults: (results: SalesResponse) => void;
}

export function SearchBar({
  searchInput,
  handleSearchInputChange,
  clearSearch,
  paymentMethod,
  setPaymentMethod,
  onSearchResults,
}: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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
  }, [searchInput, paymentMethod, onSearchResults]);

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
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
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
    </div>
  );
}
