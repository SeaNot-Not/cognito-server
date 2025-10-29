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

  // Discover users, for swiping feature (exclude self, likes, skips)
  async discover(currentUser: Partial<UserDocument>): Promise<UserDocument[]> {
    const excludedIds = [
      currentUser._id,
      ...(currentUser.likes || []),
      ...(currentUser.skips || []),
    ];

    return this.userModel
      .find({
        _id: { $nin: excludedIds },
        deletedAt: { $in: [null, undefined] },
      })
      .exec();
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
