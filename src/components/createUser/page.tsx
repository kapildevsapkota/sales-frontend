"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Role } from "@/contexts/AuthContext";

interface Distributor {
  id: number;
  name: string;
  short_form: string;
}

interface Franchise {
  id: number;
  name: string;
  short_form: string | null;
  distributor: number;
}

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(
    ["SuperAdmin", "Distributor", "Franchise", "SalesPerson", "Others"],
    {
      required_error: "Role is required",
    }
  ),
  distributor: z.number().nullable(),
  franchise: z.number().nullable(),
  isActive: z.boolean(),
  password: z.string().min(1, "Password is required"),
});

export default function CreateAccountForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isActive: true,
      role: undefined,
      distributor: null,
      franchise: null,
      firstName: "",
      lastName: "",
      email: "",
      phone_number: "",
      address: "",
      password: "",
    },
  });

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch(
          "https://sales.baliyoventures.com/api/account/distributors/"
        );
        const data = await response.json();
        setDistributors(data);
      } catch (error) {
        console.error("Error fetching distributors:", error);
      }
    };
    fetchDistributors();
  }, []);

  const fetchFranchises = async (distributorId: number) => {
    try {
      const response = await fetch(
        `https://sales.baliyoventures.com/api/account/distributors/${distributorId}/franchises/`
      );
      const data = await response.json();
      setFranchises(data);
    } catch (error) {
      console.error("Error fetching franchises:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (
        !values.phone_number ||
        !values.address ||
        !values.role ||
        !values.password
      ) {
        console.error("Missing required fields:", { values });
        throw new Error("Please fill in all required fields");
      }

      const formData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone_number: values.phone_number,
        address: values.address,
        role: values.role,
        distributor: values.distributor,
        franchise: values.franchise,
        password: values.password,
        is_active: values.isActive,
      };

      const response = await fetch(
        "https://sales.baliyoventures.com/api/account/users/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof responseData === "object"
            ? JSON.stringify(responseData)
            : "Failed to create user"
        );
      }

      toast({
        title: "Success",
        description: "User account created successfully!",
        variant: "default",
      });

      router.push("/admin");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    if (!user) return [];

    switch (user.role) {
      case Role.SuperAdmin:
        return [
          Role.SuperAdmin,
          Role.Distributor,
          Role.Franchise,
          Role.SalesPerson,
        ];
      case Role.Distributor:
        return [Role.Franchise, Role.SalesPerson];
      case Role.Franchise:
        return [Role.SalesPerson];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UserPlus className="w-6 h-6" />
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getRoleOptions().map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distributor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distributor</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const numValue = Number(value);
                        field.onChange(numValue);
                        fetchFranchises(numValue);
                        form.setValue("franchise", null);
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a distributor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {distributors.map((distributor) => (
                          <SelectItem
                            key={distributor.id}
                            value={distributor.id.toString()}
                          >
                            {distributor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="franchise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Franchise</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                      }}
                      value={field.value?.toString()}
                      disabled={!form.watch("distributor")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a franchise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {franchises.map((franchise) => (
                          <SelectItem
                            key={franchise.id}
                            value={franchise.id.toString()}
                          >
                            {franchise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
