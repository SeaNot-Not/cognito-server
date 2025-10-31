import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageService } from "./message.service";
import { PinoLogger } from "nestjs-pino";
import { SocketResponse } from "src/types/response.types";

@WebSocketGateway()
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(MessageGateway.name);
    this.logger.info("MessageGateway constructor called.");
  }

  /*
   * Gateway Lifecycle Hooks
   */
  afterInit(server: Server) {
    this.logger.info("WebSocket Gateway initialized successfully");
  }

  handleConnection(client: Socket) {
    this.logger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client disconnected: ${client.id}`);
  }

  /*
   * Gateway Handlers
   */
  @SubscribeMessage("join_match_room")
  async handleJoinRoom(
    @MessageBody() matchId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<SocketResponse> {
    try {
      if (!matchId) {
        return {
          success: false,
          message: "matchId is required",
          statusCode: 400,
        };
      }

      await socket.join(matchId);
      this.logger.info({ socketId: socket.id, matchId }, `Socket joined room`);

      // Notify others in the room (optional)
      socket.to(matchId).emit("user_joined", {
        socketId: socket.id,
      });

      // Return acknowledgment to the sender
      return {
        success: true,
        message: "Joined room successfully",
        data: { matchId },
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error({ error, socketId: socket.id }, `Error joining room`);
      return {
        success: false,
        message: "Failed to join room",
        statusCode: 500,
      };
    }
  }

  @SubscribeMessage("leave_match_room")
  async handleLeaveRoom(
    @MessageBody() matchId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<SocketResponse> {
    try {
      if (!matchId) {
        return {
          success: false,
          message: "matchId is required",
          statusCode: 400,
        };
      }

      await socket.leave(matchId);
      this.logger.info({ socketId: socket.id, matchId }, `Socket left room`);

      // Notify others in the room (optional)
      socket.to(matchId).emit("user_left", {
        socketId: socket.id,
      });

      return {
        success: true,
        message: "Left room successfully",
        data: { matchId },
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error({ error, socketId: socket.id }, `Error leaving room`);
      return {
        success: false,
        message: "Failed to leave room",
        statusCode: 500,
      };
    }
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @MessageBody() data: { matchId: string; senderId: string; text: string },
    @ConnectedSocket() socket: Socket,
  ): Promise<SocketResponse> {
    try {
      if (!data.matchId || !data.senderId || !data.text) {
        return {
          success: false,
          message: "Missing required fields",
          statusCode: 400,
        };
      }

      const message = await this.messageService.createMessage(
        data.matchId,
        data.senderId,
        data.text,
      );

      // Broadcast to ALL users in the room (including sender)
      this.server.to(data.matchId).emit("receive_message", {
        success: true,
        data: message,
        statusCode: 200,
      });

      this.logger.info({ matchId: data.matchId, senderId: data.senderId }, `Message sent in room`);

      // Return acknowledgment to the sender
      return {
        success: true,
        message: "Message sent successfully",
        data: message,
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error({ error, data }, `Error sending message`);
      return {
        success: false,
        message: "Failed to send message",
        statusCode: 500,
      };
    }
  }
}
