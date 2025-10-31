import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { Model, Types } from "mongoose";
import type { UpdateUserDtoType } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  get model(): Model<User> {
    return this.userModel;
  }

  // Find one user by email
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, deletedAt: { $in: [null, undefined] } }).exec();
  }

  // Check if a user exists by email
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel
      .exists({ email, deletedAt: { $in: [null, undefined] } })
      .exec();
    return !!user;
  }

  // Create new user
  async create(userData: Partial<UserDocument>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  // Get user by ID (exclude password)
  async getUserById(id: string): Promise<User | null> {
    return this.userModel
      .findOne({ _id: id, deletedAt: { $in: [null, undefined] } })
      .select("-password")
      .exec();
  }

  // Update user by ID
  async update(userId: string, dto: UpdateUserDtoType): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, dto, { new: true }).exec();
  }

  /*
   ** Swipe Feature Service Methods **
   */

  /**
   * Discover users for swiping feature (exclude self, likes, skips)
   * Uses cursor-based pagination for infinite scroll/batch loading
   */

  async discover(currentUser: Partial<UserDocument>, cursor?: string, limit: number = 10) {
    const excludedIds = [
      currentUser._id,
      ...(currentUser.likes || []),
      ...(currentUser.skips || []),
    ];

    // Build query
    const query: any = {
      _id: { $nin: excludedIds },
      deletedAt: { $in: [null, undefined] },
    };

    // If cursor exists, get users after that cursor
    if (cursor) {
      query._id = {
        ...query._id,
        $gt: new Types.ObjectId(cursor),
      };
    }

    // Fetch limit + 1 to check if there are more users
    // Note: If there is time, implement more advanced sorting
    const users = await this.userModel
      .find(query)
      .sort({ age: 1 }) // Order by ID for now
      .limit(limit + 1)
      .select("name age bio profileImage")
      .exec();

    // Check if there are more users
    const hasMore = users.length > limit;

    // Remove the extra user if exists
    const items = hasMore ? users.slice(0, limit) : users;

    // Order by ID for now
    // Get next cursor (last user's ID)
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]._id.toString() : null;

    return {
      users: items,
      hasMore,
      nextCursor,
    };
  }

  // Add a liked user to current user's likes array
  async addLike(userId: string, likedUserId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { likes: likedUserId } }, // $addToSet to avoid duplicates
        { new: true },
      )
      .exec();
  }

  // Add a skipped user to current user's skips array
  async addSkip(userId: string, skippedUserId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { $addToSet: { skips: skippedUserId } }, { new: true })
      .exec();
  }

  // Check if a user has liked another user
  async isLikedByTheTargetUser(userId: string, targetUserId: string): Promise<boolean> {
    const user = await this.userModel
      .findOne({
        _id: userId,
        likes: targetUserId,
      })
      .exec();

    return !!user;
  }
}
