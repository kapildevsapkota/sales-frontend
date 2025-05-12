"use client";

import type React from "react";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  toggleFilterForm: () => void;
}

export function SearchBar({
  searchInput,
  handleSearchInputChange,
  clearSearch,
  toggleFilterForm,
}: SearchBarProps) {
  return (
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
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
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
