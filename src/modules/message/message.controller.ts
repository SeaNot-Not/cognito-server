import { Controller, Get, Param, ForbiddenException, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MatchService } from "src/modules/match/match.service";
import { GetCurrentUser } from "src/common/decorators/get-current-user.decorator";
import { validateObjectId } from "src/common/utils/validate-object-id";
import type { UserDocument } from "src/modules/user/schemas/user.schema";
import { ResponseHelper } from "src/common/helpers/response.helper";

@Controller("api/messages")
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly matchService: MatchService,
  ) {}

  @Get(":matchId")
  async getMessages(
    @Param("matchId") matchId: string,
    @GetCurrentUser() user: UserDocument,
    @Query("cursor") cursor?: Date,
    @Query("limit") limit: number = 20,
  ) {
    validateObjectId(matchId, "Match ID");

    const match = await this.matchService.getMatchById(matchId);

    if (!match) {
      throw new ForbiddenException("Match not found or deleted.");
    }

    // Use .equals() for ObjectId comparison (more reliable)
    const isParticipant = match.userA.equals(user._id) || match.userB.equals(user._id);

    if (!isParticipant) {
      throw new ForbiddenException("You are not authorized to access this chat.");
    }

    const result = await this.messageService.getMessages(matchId, cursor, Number(limit));

    return ResponseHelper.cursorPaginated(
      result.messages,
      result.hasMore,
      result.nextCursor,
      result.prevCursor,
      "Messages fetched successfully",
    );
  }
}
