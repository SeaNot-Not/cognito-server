import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import envConfig from "./config/env.config";
import { AuthModule } from "./auth/auth.module";
import { MongooseConfig } from "./config/database.config";
import { LoggerConfig } from "./config/logger.config";
import { UserModule } from "./user/user.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import joiConfig from "./config/joi.config";

@Module({
  imports: [
    // Config Module For Loading Environment Variables
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
      validationSchema: joiConfig,
    }),

    // Mongoose Module for MongoDB Connection
    MongooseConfig,

    // Pino Logger for Logging HTTP Requests
    LoggerConfig,

    AuthModule,
    UserModule,
  ],

  providers: [
    // Make the Jwt Auth Guard Global
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
