"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import SubmissionResult from "./SubmissionResult";
import Swal from "sweetalert2";
import { FormData, SubmissionResponse, GiftItem, ErrorResponse } from "./gift";
import FormFields from "./FormFields";

interface Organization {
  id: number;
  name: string;
  logo: string | null;
}

interface OrganizationData {
  id: number;
  name: string;
  background_image: string;
  organization: Organization;
}

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z.string().min(10, "Contact number must be at least 10 digits"),
});

export default function InfoForm({
  initialOrgData,
}: {
  initialOrgData: OrganizationData | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResponse, setSubmissionResponse] =
    useState<SubmissionResponse | null>(null);
  const [giftList, setGiftList] = useState<GiftItem[]>([]);
  const { toast } = useToast();

  // Lock body scroll while this component is mounted
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/slot-machine/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            lucky_draw_system: "1",
          }),
        }
      );

      if (!response.ok) {
        const responseData: ErrorResponse = await response.json();
        Swal.fire({
          title: "Error!",
          text: responseData.error || "An unknown error occurred",
          icon: "error",
          confirmButtonText: "Ok",
        });
        throw new Error(responseData.error || "An unknown error occurred");
      }

      toast({
        title: "Form Submitted Successfully",
        description: "Your form has been submitted.",
      });

      const result: SubmissionResponse = await response.json();
      setSubmissionResponse(result);

      // Store submission data for slot machine
      localStorage.setItem("submissionData", JSON.stringify(result));
      localStorage.setItem("orgData", JSON.stringify(initialOrgData));

      toast({
        title: "Form Submitted",
        description: "Your information has been successfully submitted.",
      });

      const giftListResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/get-gift-list/?lucky_draw_system_id=${
          result.gift[0]?.lucky_draw_system || initialOrgData?.id || 1
        }`
      );

      if (!giftListResponse.ok) {
        throw new Error("Failed to fetch gift list");
      }

      const giftListData: GiftItem[] = await giftListResponse.json();
      setGiftList(giftListData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col text-organization-primary relative">
      {/* Background with Gradient SVG */}
      <div className="absolute inset-0">
        <img
          src="/newtestframe.png"
          alt="Background gradient"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <main className="flex-grow h-screen flex flex-col justify-center items-center relative z-10">
        {!submissionResponse ? (
          <div className="max-w-3xl w-full  backdrop-blur-sm p-4 ">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormFields register={register} errors={errors} />
              <div className="flex justify-center ">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group transform transition-all duration-1000 ease-in-out
                    hover:scale-105 hover:rotate-1
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-4 focus:ring-yellow-400/50
                    animate-bounce"
                  style={{
                    filter: "drop-shadow(0 10px 20px rgba(255, 215, 0, 0.3))",
                  }}
                >
                  <img
                    src="/spin button.png"
                    alt="Submit & Continue"
                    className="h-28 w-auto max-w-xs object-contain mt-16 "
                    style={{
                      filter: isSubmitting
                        ? "brightness(0.7)"
                        : "brightness(1)",
                    }}
                  />
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="animate-spin h-8 w-8 text-yellow-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <SubmissionResult
            submissionResponse={submissionResponse}
            giftList={giftList}
          />
        )}
      </main>
    </div>
  );
}
