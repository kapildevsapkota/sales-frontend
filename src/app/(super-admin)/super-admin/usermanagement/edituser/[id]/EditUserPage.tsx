"use client";

import { useState, useEffect } from "react";
import CreateAccountForm, {
  CreateUserFormData,
} from "@/components/createUser/page";
import { api } from "@/lib/api";

interface EditUserPageProps {
  id: string;
}

export default function EditUserPage({ id }: EditUserPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<Omit<
    CreateUserFormData,
    "password"
  > | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/api/account/users/${id}`);
        setUserData(response.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch user data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  if (loading)
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
    );
  if (!userData) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateAccountForm
        initialValues={userData}
        isEditMode
        userId={id}
      />
    </div>
  );
}
