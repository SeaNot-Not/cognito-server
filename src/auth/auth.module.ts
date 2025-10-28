import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User, UserSchema } from "./schemas/user.schema";
import { loginJwtConfig } from "src/config/jwt.config";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), loginJwtConfig],

  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
