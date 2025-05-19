"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  role: Role;
  franchise: string | null;
  is_active?: boolean;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(
    null
  );
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/api/account/users/");
      setUsers(response.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error fetching users:", error);
      const msg =
        error?.response?.data?.detail ||
        error.message ||
        "Failed to fetch users";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    router.push("/admin/usermanagement/createuser");
  };

  const handleEditUser = (phoneNumber: string) => {
    router.push(
      `/admin/usermanagement/edituser/${encodeURIComponent(phoneNumber)}`
    );
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUserPhone) return;

    setLoading(true);
    try {
      await api.delete(
        `/account/users/${encodeURIComponent(selectedUserPhone)}/`
      );
      toast({
        title: "Success",
        description: "User deleted successfully!",
        variant: "default",
      });
      setUsers(users.filter((u) => u.phone_number !== selectedUserPhone));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Deletion error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.detail || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-semibold">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                User Management
              </CardTitle>
              <CardDescription className="mt-1 md:mt-2">
                Manage all user accounts in the system
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
              <Button
                onClick={handleCreateUser}
                className="gap-2 w-full md:w-auto"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && users.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading data...</p>
            </div>
          ) : users.length > 0 ? (
            <>
              {isMobile ? (
                <div className="space-y-3 md:hidden">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="font-medium">
                            {user.role === "SalesPerson" ? (
                              <Link
                                href={`/admin/salespersons/${user.phone_number}`}
                                className="text-blue-600 hover:underline"
                              >
                                {user.first_name} {user.last_name}
                              </Link>
                            ) : (
                              <span>
                                {user.first_name} {user.last_name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            Phone: {user.phone_number}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                            {user.franchise && (
                              <Badge variant="secondary" className="text-xs">
                                {user.franchise}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user.phone_number)}
                          className="flex-1"
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUserPhone(user.phone_number);
                            setSelectedUserName(
                              `${user.first_name} ${user.last_name}`
                            );
                            setIsDeleteDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hidden md:block rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Franchise</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.role === "SalesPerson" ? (
                              <Link
                                href={`/admin/salesPersons/${user.phone_number}`}
                                className="hover:underline"
                              >
                                {user.first_name} {user.last_name}
                              </Link>
                            ) : (
                              <span>
                                {user.first_name} {user.last_name}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.franchise || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleEditUser(user.phone_number)
                                }
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUserPhone(user.phone_number);
                                  setSelectedUserName(
                                    `${user.first_name} ${user.last_name}`
                                  );
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user {selectedUserName && <strong>{selectedUserName}</strong>}{" "}
              with phone number <strong>{selectedUserPhone}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
