import { Controller, Post, Param, Get } from "@nestjs/common";
import { MatchService } from "./match.service";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";

@Controller("api/matches")
export class MatchController {
  constructor(private matchService: MatchService) {}

  // @POST - private - /api/matches/like
  @Post("like/:targetId")
  async likeUser(@GetCurrentUser("_id") userId: string, @Param("targetId") targetId: string) {
    const result = await this.matchService.likeUser(userId, targetId);

    return {
      data: result,
      message: `User liked ${result.newMatch ? "and matched" : "successfully"}.`,
      statusCode: 200,
    };
  }

  // @POST - private - /api/matches/skip
  @Post("skip/:targetId")
  async skipUser(@GetCurrentUser("_id") userId: string, @Param("targetId") targetId: string) {
    const result = await this.matchService.skipUser(userId, targetId);

    return {
      data: result,
      message: "User skipped successfully.",
      statusCode: 200,
    };
  }

  // @GET - private - /api/matches
  @Get()
  async getUserMatches(@GetCurrentUser("_id") userId: string) {
    const result = await this.matchService.getUserMatches(userId);

    return {
      data: result,
      message: "User matches fetched successfully.",
      statusCode: 200,
    };
  }
}
