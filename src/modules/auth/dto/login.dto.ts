import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),

  password: z.string().min(1, "Password is required").trim(),
});

export class LoginDto extends createZodDto(loginSchema) {}

export type LoginDtoType = z.infer<typeof loginSchema>;
