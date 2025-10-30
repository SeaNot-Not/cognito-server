import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { UserService } from "src/modules/user/user.service";
import { UserDocument } from "../user/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // @POST - public - /api/auth/register
  async signup(dto: SignupDto): Promise<void> {
    const { email, password } = dto;

    const isEmailExist = await this.userService.existsByEmail(email);
    if (isEmailExist) throw new ConflictException("Email already in use. Try another one.");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({ ...dto, password: hashedPassword });

    if (!user) throw new ConflictException("User registration failed.");
  }

  // @POST - public - /api/auth/login
  async login(dto: LoginDto): Promise<{ token: string; userData: Partial<UserDocument> }> {
    const { email, password } = dto;

    const loginErrorMessage = "Invalid email or password.";

    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException(loginErrorMessage);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException(loginErrorMessage);

    const token = this.jwtService.sign({ userId: user._id });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return { token, userData: userWithoutPassword };
  }
}
