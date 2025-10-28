import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Match } from "./schemas/match.schema";
import { UserService } from "src/user/user.service";

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<Match>,
    private userService: UserService,
  ) {}

  // Like a user and check for mutual like
  async likeUser(currentUserId: string, targetUserId: string) {
    // Step 1: Add to current user's likes
    await this.userService.addLike(currentUserId, targetUserId);

    // Step 2: Check if target user liked back
    const isMutual = await this.userService.hasLiked(targetUserId, currentUserId);

    if (isMutual) {
      // Step 3: Create match if not already exists
      const existingMatch = await this.matchModel.findOne({
        $or: [
          { user1: currentUserId, user2: targetUserId },
          { user1: targetUserId, user2: currentUserId },
        ],
      });

      if (!existingMatch) {
        const match = await this.matchModel.create({
          user1: currentUserId,
          user2: targetUserId,
        });

        // (optional) emit socket event later
        return { match, newMatch: true };
      }

      return { match: existingMatch, newMatch: false };
    }

    return { newMatch: false };
  }

  // Skip a user
  async skipUser(currentUserId: string, targetUserId: string) {
    await this.userService.addSkip(currentUserId, targetUserId);
    return { skipped: true };
  }

  // Get all matches for a user
  async getUserMatches(userId: string) {
    return this.matchModel
      .find({
        unmatched: false,
        $or: [{ user1: userId }, { user2: userId }],
      })
      .populate(["user1", "user2"], "name age bio profilePicture")
      .exec();
  }
}
