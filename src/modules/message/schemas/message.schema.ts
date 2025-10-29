import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";
import { Match } from "src/modules/match/schemas/match.schema";
import { User } from "src/modules/user/schemas/user.schema";

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: Match.name, required: true })
  matchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, required: true })
  text: string;

  // Soft delete
  @Prop({ default: null })
  deletedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ matchId: 1, senderId: 1 }, { unique: true });
