import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./schemas/message.schema";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MessageGateway } from "./message.gateway";
import { MatchModule } from "src/modules/match/match.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MatchModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
