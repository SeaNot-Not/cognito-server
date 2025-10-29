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
  async getMessages(matchId: string, cursor?: string, limit: number = 20) {
    validateObjectId(matchId, "Match ID");

    // Build query
    const query: any = {
      matchId: new Types.ObjectId(matchId),
    };

    // If cursor exists, get messages before that cursor (older messages)
    if (cursor) {
      validateObjectId(cursor, "Cursor");
      const cursorMessage = await this.messageModel.findById(cursor).select("createdAt");

      if (cursorMessage) {
        // Get messages older than cursor
        query.createdAt = { $lt: cursorMessage };
      }
    }

    // Fetch limit + 1 to check if there are more messages
    const messages = await this.messageModel
      .find(query)
      .populate("senderId", "name profilePicture")
      .sort({ createdAt: -1 }) // Newest first (for pagination)
      .limit(limit + 1)
      .exec();

    // Check if there are more messages
    const hasMore = messages.length > limit;

    // Remove the extra message if exists
    const items = hasMore ? messages.slice(0, limit) : messages;

    // Reverse to show oldest first in the UI
    const orderedMessages = items.reverse();

    // Get cursors
    const nextCursor = hasMore ? items[items.length - 1]._id.toString() : null;

    const prevCursor = cursor || null;

    return {
      messages: orderedMessages,
      hasMore,
      nextCursor,
      prevCursor,
    };
  }
}
