import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { Public } from "src/common/decorators/public.decorator";
import { ResponseHelper } from "src/common/helpers/response.helper";

@Controller("api/auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // @POST - public - /api/auth/register
  @Public()
  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    await this.authService.signup(dto);

    return ResponseHelper.noContent("User registered successfully.");
  }

  // @POST - public - /api/auth/login
  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, userData } = await this.authService.login(dto);

    // Generate Cookie
    const nodeEnv = this.configService.get<string>("nodeEnv");
    res.cookie("cognito-access-token", token, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: nodeEnv === "production" ? "none" : "lax",
      maxAge: 60_000 * 60 * 24 * 60, // 60 days
    });

    return ResponseHelper.success(userData, "User logged in successfully.");
  }

  // @POST - public - /api/auth/logout
  @Public()
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("cognito-access-token");
    return ResponseHelper.noContent("User logged out successfully.");
  }
}
