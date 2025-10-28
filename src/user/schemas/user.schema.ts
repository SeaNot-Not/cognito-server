import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types as MongooseTypes } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
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
  likes: User[];

  // Skips
  @Prop({ type: [MongooseTypes.ObjectId], ref: User.name, default: [] })
  skips: User[];

  // Soft Delete
  @Prop({ default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
