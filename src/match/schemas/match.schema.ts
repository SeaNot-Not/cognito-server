import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MatchDocument = HydratedDocument<Match>;

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userB: Types.ObjectId;

  @Prop({ default: false })
  unmatched: boolean;

  // Soft Delete
  @Prop({ default: null })
  deletedAt?: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Add compound unique index
MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });
