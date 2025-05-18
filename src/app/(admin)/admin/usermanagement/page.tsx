"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Pencil, Trash2, AlertCircle, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/contexts/AuthContext";

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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getAccessToken = () => {
    if (currentUser && 'token' in currentUser) {
      return (currentUser as any).token;
    }
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      return storedToken;
    }
    return null;
  };

  const token = getAccessToken();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      
      const response = await fetch(`${baseUrl}/api/account/users/`, { headers });
      
      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = typeof errorData === "object" ? 
            JSON.stringify(errorData) : 
            `Error: ${response.status} ${response.statusText}`;
        } catch (e) {
          errorText = `Error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(`Failed to fetch users: ${errorText}`);
      }
      
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch users");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]); 

  const handleCreateUser = () => {
    router.push("/admin/usermanagement/createuser");
  };

  const handleEditUser = (phoneNumber: string) => {
    router.push(`/admin/usermanagement/edituser/${encodeURIComponent(phoneNumber)}`);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUserPhone) return;

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    
      const response = await fetch(
        `${baseUrl}/api/account/users/${encodeURIComponent(selectedUserPhone)}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to delete user";
        try {
          const errorData = await response.json();
          errorMessage = typeof errorData === "object" ? 
            JSON.stringify(errorData) : 
            `Error: ${response.status} ${response.statusText}`;
        } catch (e) {
          // Keep default error message
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "User deleted successfully!",
        variant: "default",
      });

      setUsers(users.filter(user => user.phone_number !== selectedUserPhone));
    } catch (error) {
      console.error("Deletion error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication token not found. Please log in again.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

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
              <Button onClick={handleRefresh} variant="outline" disabled={loading} className="w-full md:w-auto">
                {loading ? "Loading..." : "Refresh"}
              </Button>
              <Button onClick={handleCreateUser} className="gap-2 w-full md:w-auto">
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
              {/* Mobile View - Checklist Style */}
              {isMobile ? (
                <div className="space-y-3 md:hidden">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                       
                        <div className="flex-1">
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
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
                            setSelectedUserName(`${user.first_name} ${user.last_name}`);
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
                /* Desktop View - Table */
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
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.franchise || "-"}</TableCell>
                          <TableCell className="">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user.phone_number)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUserPhone(user.phone_number);
                                  setSelectedUserName(`${user.first_name} ${user.last_name}`);
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {selectedUserName && <span> <strong>{selectedUserName}</strong></span>} with phone number <strong>{selectedUserPhone}</strong> and remove all associated data.
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