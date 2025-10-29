import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types as MongooseTypes } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  // Authentication
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  // User Info
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ default: "" })
  bio: string;

  @Prop({ default: "" })
  profileImage: string;

  // Likes
  @Prop({ type: [MongooseTypes.ObjectId], ref: User.name, default: [] })
  likes: MongooseTypes.ObjectId[];

  // Skips
  @Prop({ type: [MongooseTypes.ObjectId], ref: User.name, default: [] })
  skips: MongooseTypes.ObjectId[];

  // Soft Delete
  @Prop({ default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
