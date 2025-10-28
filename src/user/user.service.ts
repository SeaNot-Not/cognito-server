import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
import type { UpdateUserDtoType } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  get model(): Model<User> {
    return this.userModel;
  }

  // Find one user by email
  async findByEmail(email: string): Promise<User | null> {
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
  async create(userData: Partial<User>): Promise<User> {
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
  async update(userId: string, dto: UpdateUserDtoType): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, dto, { new: true }).exec();
  }

  // Discover users for swiping (exclude self, likes, skips)
  async discover(currentUser: Partial<User>): Promise<User[]> {
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
  async addLike(userId: string, likedUserId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { likes: likedUserId } }, // $addToSet to avoid duplicates
        { new: true },
      )
      .exec();

    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  // Add a skipped user to current user's skips array
  async addSkip(userId: string, skippedUserId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $addToSet: { skips: skippedUserId } }, { new: true })
      .exec(); // $addToSet to avoid duplicates

    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  // Check if a user has liked another user
  async hasLiked(userId: string, targetUserId: string): Promise<boolean> {
    const user = await this.userModel.findOne({ _id: userId, likes: targetUserId }).exec();

    return !!user;
  }
}
