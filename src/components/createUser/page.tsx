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

interface Factory {
  id: number;
  name: string;
  short_form: string | null;
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
  factory: z.number().nullable(),
});

export default function CreateAccountForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);

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
      factory: null,
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

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const response = await fetch(
          "https://sales.baliyoventures.com/api/account/factories/"
        );
        const data = await response.json();
        setFactories(data);
      } catch (error) {
        console.error("Error fetching factories:", error);
      }
    };
    fetchFactories();
  }, []);

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
        factory: values.factory,
      };

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/account/users/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        return [Role.Distributor, Role.Franchise, Role.Logistic];
      case Role.Distributor:
        return [Role.Franchise, Role.SalesPerson];
      case Role.Franchise:
        return [Role.SalesPerson];
      default:
        return [];
    }
  };

  const showFieldsByRole = (selectedRole: string | undefined) => {
    if (!selectedRole)
      return {
        showFactory: false,
        showDistributor: false,
        showFranchise: false,
      };

    switch (selectedRole) {
      case Role.SuperAdmin:
        return {
          showFactory: true,
          showDistributor: false,
          showFranchise: false,
        };
      case Role.Distributor:
        return {
          showFactory: false,
          showDistributor: true,
          showFranchise: false,
        };
      case Role.Franchise:
      case Role.SalesPerson:
        return {
          showFactory: false,
          showDistributor: true,
          showFranchise: true,
        };
      default:
        return {
          showFactory: false,
          showDistributor: false,
          showFranchise: false,
        };
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50 border-b p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <UserPlus className="w-6 h-6 text-primary" />
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 md:space-y-8"
          >
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl font-medium text-gray-800">
                Personal Information
              </h3>
              <div className="grid gap-4 md:gap-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          {...field}
                          className="h-10"
                        />
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
                      <FormLabel className="text-sm font-medium">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                          className="h-10"
                        />
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
                      <FormLabel className="text-sm font-medium">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
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
                    <FormLabel className="text-sm font-medium">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter address"
                        {...field}
                        className="min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account Settings Section */}
            <div className="space-y-4 pt-4 border-t md:space-y-6">
              <h3 className="text-xl font-medium text-gray-800 pt-2">
                Account Settings
              </h3>
              <div className="grid gap-4 md:gap-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Role
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("distributor", null);
                          form.setValue("franchise", null);
                          form.setValue("factory", null);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showFieldsByRole(form.watch("role")).showFactory && (
                  <FormField
                    control={form.control}
                    name="factory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Factory
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select a factory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {factories.map((factory) => (
                              <SelectItem
                                key={factory.id}
                                value={factory.id.toString()}
                              >
                                {factory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {showFieldsByRole(form.watch("role")).showDistributor && (
                  <FormField
                    control={form.control}
                    name="distributor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Distributor
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const numValue = Number(value);
                            field.onChange(numValue);
                            fetchFranchises(numValue);
                            form.setValue("franchise", null);
                            form.setValue("factory", null);
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
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
                )}
                {showFieldsByRole(form.watch("role")).showFranchise && (
                  <FormField
                    control={form.control}
                    name="franchise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Franchise
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                          }}
                          value={field.value?.toString()}
                          disabled={!form.watch("distributor")}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
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
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                type="submit"
                className="w-full md:w-auto px-8 h-12 font-medium bg-blue-500 hover:bg-blue-600 text-base"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
