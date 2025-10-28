import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { loginJwtModule } from "src/config/jwt.config";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "src/user/user.module";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [PassportModule, loginJwtModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
