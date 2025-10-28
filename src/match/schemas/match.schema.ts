import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MatchDocument = HydratedDocument<Match>;

@Schema({ timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user2: Types.ObjectId;

  @Prop({ default: false })
  unmatched: boolean;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
