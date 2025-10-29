import { Body, Controller, Get, NotFoundException, Param, Patch, Query, Res } from "@nestjs/common";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";
import type { UserDocument } from "./schemas/user.schema";
import { UserService } from "./user.service";
import { validateObjectId } from "src/common/utils/validate-object-id";
import type { UpdateUserDtoType } from "./dto/update-user.dto";
import { ResponseHelper } from "src/common/helpers/response.helper";

@Controller("api/users")
export class UserController {
  constructor(private userService: UserService) {}

  // @GET - private - /api/users/me
  @Get("me")
  async me(@GetCurrentUser() user: UserDocument) {
    return ResponseHelper.success(user, "Current user data retrieved.");
  }

  // @GET - private - /api/users/discover
  @Get("discover")
  async discover(
    @GetCurrentUser() user: UserDocument,
    @Query("cursor") cursor?: string,
    @Query("limit") limit: number = 10,
  ) {
    const result = await this.userService.discover(user, cursor, Number(limit));

    return ResponseHelper.cursorPaginated(
      result.users,
      result.hasMore,
      result.nextCursor,
      null, // No prevCursor for discover (only forward)
      "Discover users retrieved successfully",
    );
  }

  // @GET - private - /api/users/:id
  @Get(":id")
  async getUser(@Param("id") id: string) {
    validateObjectId(id, "User ID");

    const user = await this.userService.getUserById(id);

    if (!user) throw new NotFoundException("User not found.");

    return ResponseHelper.success(user, "User data retrieved.");
  }

  // @PATCH - @PRIVATE - /api/users/me
  @Patch("me")
  async updateUser(@GetCurrentUser("_id") userId: string, @Body() dto: UpdateUserDtoType) {
    validateObjectId(userId, "User ID");

    const user = await this.userService.update(userId, dto);

    if (!user) throw new NotFoundException("User not found.");

    return ResponseHelper.success(user, "User data updated.");
  }
}
