import { Controller, Post, Param, Get } from "@nestjs/common";
import { MatchService } from "./match.service";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";
import { ResponseHelper } from "src/common/helpers/response.helper";

@Controller("api/matches")
export class MatchController {
  constructor(private matchService: MatchService) {}

  // @POST - private - /api/matches/like
  @Post("like/:targetId")
  async likeUser(@GetCurrentUser("_id") userId: string, @Param("targetId") targetId: string) {
    const result = await this.matchService.likeUser(userId, targetId);

    return ResponseHelper.success(
      result,
      `User liked ${result.newMatch ? "and matched" : "successfully"}.`,
    );
  }

  // @POST - private - /api/matches/skip
  @Post("skip/:targetId")
  async skipUser(@GetCurrentUser("_id") userId: string, @Param("targetId") targetId: string) {
    const result = await this.matchService.skipUser(userId, targetId);

    return ResponseHelper.success(result, "User skipped successfully.");
  }

  // @GET - private - /api/matches
  @Get()
  async getUserMatches(@GetCurrentUser("_id") userId: string) {
    const result = await this.matchService.getUserMatches(userId);

    return ResponseHelper.success(result, "User matches fetched successfully.");
  }
}
