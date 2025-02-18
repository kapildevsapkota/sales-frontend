"use client";

import { useEffect, useState } from "react";
import { TeamMember } from "@/types/team";
import { columns } from "./components/team-columns";
import { DataTable } from "./components/team-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditTeamDialog } from "./components/team-edit-dialog";

interface TeamResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TeamMember[];
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTeam = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<TeamResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team/?page=${page}&page_size=${size}`
      );
      setTeam(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching team:", error);
      showError("Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<TeamResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/team/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setTeam(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching team:", error);
      showError("Failed to search team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handlePageChange = (page: number) => {
    fetchTeam(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchTeam(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={team?.results || []}
        onDataChange={fetchTeam}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((team?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditTeamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchTeam}
      />
    </div>
  );
}
