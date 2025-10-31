import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message } from "./schemas/message.schema";
import { PinoLogger } from "nestjs-pino";
import { validateObjectId } from "src/common/utils/validate-object-id";

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(MessageService.name);
  }

  async createMessage(matchId: string, senderId: string, text: string) {
    validateObjectId(matchId, "Match ID");
    validateObjectId(senderId, "Sender ID");

    try {
      const message = await this.messageModel.create({
        matchId: new Types.ObjectId(matchId),
        senderId: new Types.ObjectId(senderId),
        text,
        createdAt: new Date(),
      });

      // Populate sender info before returning
      return await message.populate("senderId", "name profileImage");
    } catch (error) {
      this.logger.error({ error, matchId, senderId }, "Failed to create message");
      throw error;
    }
  }

  /**
   * Get messages with cursor-based pagination
   * Loads older messages when scrolling up
   */
  async getMessages(matchId: string, cursor?: Date, limit: number = 10) {
    // Build query - ensure matchId is queried as ObjectId for reliable matching
    const query: any = {
      matchId: new Types.ObjectId(matchId),
      deletedAt: { $in: [null, undefined] },
    };

    if (cursor) {
      // cursor may be a Date already; ensure we compare against a Date
      query.createdAt = { $lt: new Date(cursor) };
    } // If cursor of last message fetched timestamp is provided, query messages created before that timestamp

    const messages = await this.messageModel
      .find(query)
      .populate("senderId", "name profileImage")
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
