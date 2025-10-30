import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message } from "./schemas/message.schema";
import { validateObjectId } from "src/common/utils/validate-object-id";

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async createMessage(matchId: string, senderId: string, text: string) {
    validateObjectId(matchId, "Match ID");
    validateObjectId(senderId, "Sender ID");

    const message = await this.messageModel.create({
      matchId: new Types.ObjectId(matchId),
      senderId: new Types.ObjectId(senderId),
      text,
    });

    // Populate sender info before returning
    return await message.populate("senderId", "name profilePicture");
  }

  /**
   * Get messages with cursor-based pagination
   * Loads older messages when scrolling up
   */
  async getMessages(matchId: string, cursor?: Date, limit: number = 10) {
    // Build query
    const query: any = {
      matchId: matchId,
      deletedAt: { $in: [null, undefined] },
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    } // If cursor of last message fetched timestamp is provided, query comments created before that timestamp

    const messages = await this.messageModel
      .find(query)
      .populate("senderId", "name profilePicture")
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .exec();

    // Check if there are more messages
    const hasMore = messages.length > 0;

    // Set if there is still cursor to fetch more messages (for infinite scroll)
    const nextCursor = hasMore ? messages[messages.length - 1].createdAt : null;

    const prevCursor = cursor || null;

    return {
      messages,
      hasMore,
      nextCursor,
      prevCursor,
    };
  }
}
