import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Match, MatchSchema } from "./schemas/match.schema";
import { MatchService } from "./match.service";
import { MatchController } from "./match.controller";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]), UserModule],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
