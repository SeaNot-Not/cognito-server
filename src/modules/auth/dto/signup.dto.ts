import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .trim(),

  name: z.string().min(1, "Name is required").max(50, "Name is too long!").trim(),

  age: z.number().int().min(18, "You must be 18 years old or older"),

  bio: z.string().optional(),

  profileImage: z
    .string()
    .trim()
    .url("Invalid URL format")
    .startsWith("https://", "Picture URL must start with 'https://'")
    .optional(),
});

export class SignupDto extends createZodDto(signupSchema) {}

export type SignupDtoType = z.infer<typeof signupSchema>;
