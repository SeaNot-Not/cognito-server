import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  get model(): Model<User> {
    return this.userModel;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, deletedAt: null });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email, deletedAt: null });
    return !!user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }
}
