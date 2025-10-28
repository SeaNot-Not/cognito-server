import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "./schemas/user.schema";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // @POST - public - /api/auth/register
  async signup(dto: SignupDto): Promise<{ message: string }> {
    const { email, password } = dto;

    const isEmailExist = await this.userModel.exists({ email, deletedAt: null });
    if (isEmailExist) throw new ConflictException("Email already in use. Try another one.");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({ ...dto, password: hashedPassword });
    await user.save();

    return { message: "Registration successful." };
  }

  // @POST - public - /api/auth/login
  async login(dto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    const { email, password } = dto;
    const loginErrorMessage = "Invalid email or password.";

    const user = await this.userModel.findOne({ email, deletedAt: null });
    if (!user) throw new UnauthorizedException(loginErrorMessage);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException(loginErrorMessage);

    const token = this.jwtService.sign({ userId: user._id });

    // Remove Password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return { token, user: userWithoutPassword };
  }
}
