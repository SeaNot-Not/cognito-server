import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { signupSchema } from "src/modules/auth/dto/signup.dto";

const updateUserSchema = signupSchema
  .pick({
    name: true,
    age: true,
    bio: true,
    profileImage: true,
  })
  .partial();

export const UpdateUserDto = createZodDto(updateUserSchema);

export type UpdateUserDtoType = z.infer<typeof updateUserSchema>;
