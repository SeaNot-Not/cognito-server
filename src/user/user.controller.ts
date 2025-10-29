import { Body, Controller, Get, NotFoundException, Param, Patch } from "@nestjs/common";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";
import type { UserDocument } from "./schemas/user.schema";
import { UserService } from "./user.service";
import { validateObjectId } from "src/common/utils/validate-object-id";
import type { UpdateUserDtoType } from "./dto/update-user.dto";

@Controller("api/users")
export class UserController {
  constructor(private userService: UserService) {}

  // @GET - private - /api/users/me
  @Get("me")
  async me(@GetCurrentUser() user: UserDocument) {
    return { data: user, message: "Current user retrieved.", statusCode: 200 };
  }

  // @GET - private - /api/users/discover
  @Get("discover")
  async discover(@GetCurrentUser() user: UserDocument) {
    const users = await this.userService.discover(user);
    return { data: users, message: "Discover users retrieved.", statusCode: 200 };
  }

  // @GET - private - /api/users/:id
  @Get(":id")
  async getUser(@Param("id") id: string) {
    validateObjectId(id, "User ID");

    const user = await this.userService.getUserById(id);

    if (!user) throw new NotFoundException("User not found.");

    return { data: user, message: "User found.", statusCode: 200 };
  }

  // @PATCH - @PRIVATE - /api/users/me
  @Patch("me")
  async updateUser(@GetCurrentUser("_id") userId: string, @Body() dto: UpdateUserDtoType) {
    validateObjectId(userId, "User ID");

    const user = await this.userService.update(userId, dto);

    if (!user) throw new NotFoundException("User not found.");

    return { data: user, message: "User updated.", statusCode: 200 };
  }
}
