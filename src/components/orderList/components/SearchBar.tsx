"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface SearchBarProps {
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  toggleFilterForm: () => void;
  onSearchResults: (results: unknown) => void;
}

export function SearchBar({
  searchInput,
  handleSearchInputChange,
  clearSearch,
  toggleFilterForm,
  onSearchResults,
}: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Handle search with backend API
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Don't search if input is empty or too short
    if (!searchInput || searchInput.length < 2) {
      return;
    }

    // Set a timeout to avoid making too many requests while typing
    searchTimeout.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const token = localStorage.getItem("accessToken");

        // Make API call to backend search endpoint with the format api/orders/?search={}
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }api/sales/orders/?search=${encodeURIComponent(searchInput)}`,
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
  }, [searchInput, onSearchResults]);

  return (
    <div className="relative w-full md:max-w-xl">
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
        <Button
          ref={filterButtonRef}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 whitespace-nowrap w-full md:w-auto"
          onClick={toggleFilterForm}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>
    </div>
  );
}
