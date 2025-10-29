import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Match } from "./schemas/match.schema";
import { UserService } from "src/modules/user/user.service";
import { validateObjectId } from "src/common/utils/validate-object-id";

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<Match>,
    private userService: UserService,
  ) {}

  // Get Match by ID
  async getMatchById(id: string): Promise<Match | null> {
    return this.matchModel.findById(id).exec();
  }

  // Get all matches for a user
  async getUserMatches(userId: string) {
    return this.matchModel
      .find({
        unmatched: false,
        $or: [{ userA: userId }, { userB: userId }],
        deletedAt: null,
      })
      .populate("userA userB", "name age bio profilePicture")
      .exec();
  }

  // Like a user and check for mutual like
  async likeUser(currentUserId: string, targetUserId: string) {
    validateObjectId(currentUserId, "User ID");
    validateObjectId(targetUserId, "User ID");

    // Check if ids are the same
    if (currentUserId === targetUserId) throw new BadRequestException("Cannot like yourself.");

    // Add like to current user
    const user = await this.userService.addLike(currentUserId, targetUserId);
    if (!user) throw new NotFoundException("User not found.");

    // Check if the current user is in the target user's likes array
    const isMutualInLikes = await this.userService.isLikedByTheTargetUser(
      targetUserId,
      currentUserId,
    );

    if (isMutualInLikes) {
      const existingMatch = await this.matchModel.findOne({
        $or: [
          { userA: currentUserId, userB: targetUserId },
          { userA: targetUserId, userB: currentUserId },
        ],
      });

      // Create new match if no existing match
      if (!existingMatch) {
        const match = await this.matchModel.create({
          userA: currentUserId,
          userB: targetUserId,
        });

        // (optional) emit socket event later
        return { match, newMatch: true };
      }

      return { match: existingMatch, newMatch: false };
    }

    return { match: null, newMatch: false };
  }

  // Skip a user
  async skipUser(currentUserId: string, targetUserId: string) {
    validateObjectId(currentUserId, "User ID");
    validateObjectId(targetUserId, "User ID");

    // Check if ids are the same
    if (currentUserId === targetUserId) throw new BadRequestException("Cannot skip yourself.");

    const user = await this.userService.addSkip(currentUserId, targetUserId);

    if (!user) throw new NotFoundException("User not found.");

    return { skipped: true };
  }
}
