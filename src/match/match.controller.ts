import { Controller, Post, Param, Get } from "@nestjs/common";
import { MatchService } from "./match.service";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";

@Controller("api/matches")
export class MatchController {
  constructor(private matchService: MatchService) {}

  // @POST - private - /api/matches/like
  @Post("like/:targetId")
  async likeUser(@GetCurrentUser("_id") userId: string, @Param("targetId") targetId: string) {
    return this.matchService.likeUser(userId, targetId);
  }

  // @POST - private - /api/matches/skip
  @Post("skip/:targetId")
  async skipUser(@GetCurrentUser("_id") userId: string, @Param("targetId") targetId: string) {
    return this.matchService.skipUser(userId, targetId);
  }

  // @GET - private - /api/matches
  @Get()
  async getUserMatches(@GetCurrentUser("_id") userId: string) {
    return this.matchService.getUserMatches(userId);
  }
}
