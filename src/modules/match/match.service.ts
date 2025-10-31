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
    // Ensure we query using ObjectId to match stored ObjectId fields
    const userObjectId = new Types.ObjectId(userId);
    return this.matchModel
      .find({
        unmatched: false,
        $or: [{ userA: userObjectId }, { userB: userObjectId }],
        deletedAt: null,
      })
      .populate("userA userB", "name age bio profileImage")
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
      // Cast ids to ObjectId when searching for existing matches
      const existingMatch = await this.matchModel.findOne({
        $or: [
          { userA: new Types.ObjectId(currentUserId), userB: new Types.ObjectId(targetUserId) },
          { userA: new Types.ObjectId(targetUserId), userB: new Types.ObjectId(currentUserId) },
        ],
      });

      // Create new match if no existing match
      if (!existingMatch) {
        const match = await this.matchModel.create({
          // store as ObjectId explicitly to avoid string vs ObjectId mismatch
          userA: new Types.ObjectId(currentUserId),
          userB: new Types.ObjectId(targetUserId),
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
