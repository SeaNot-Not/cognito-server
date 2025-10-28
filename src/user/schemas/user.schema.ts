import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ default: "" })
  bio: string;

  @Prop({ default: "" })
  profileImage: string;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
