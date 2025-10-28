import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const loginJwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>("jwtSecret"),
    signOptions: {
      expiresIn: "60d",
    },
  }),
  inject: [ConfigService],
});
