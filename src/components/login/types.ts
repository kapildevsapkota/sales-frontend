import { z } from "zod";

export const loginSchema = z.object({
  phone_number: z
    .string()
    .min(9, "Phone number must be minimum 9 digits")
    .regex(/^\d+$/, "Phone number must be a number"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
