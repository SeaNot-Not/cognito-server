import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller("api/auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // @POST - public - /api/auth/register
  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // @POST - public - /api/auth/login
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(dto);

    // Generate Cookie
    const nodeEnv = this.configService.get<string>("nodeEnv");
    res.cookie("cognito-access-token", token, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: nodeEnv === "production" ? "none" : "lax",
      maxAge: 60_000 * 60 * 24 * 60, // 60 days
    });

    return { data: user, message: "Login successful." };
  }

  // @POST - public - /api/auth/logout
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("cognito-access-token");
    return { message: "Logout successful." };
  }
}
