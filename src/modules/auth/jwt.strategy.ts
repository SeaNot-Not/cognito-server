import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UserService } from "src/modules/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies["cognito-access-token"]]), // Extract Token from Cookie
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: { userId: string }) {
    const user = await this.userService.model.findById(payload.userId).select("-password");

    if (!user) throw new UnauthorizedException("Unauthorized Access!");

    if (user.deletedAt) throw new UnauthorizedException("Unauthorized Access!");

    return user;
  }
}
