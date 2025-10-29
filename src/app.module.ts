import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import envConfig from "./config/env.config";
import { AuthModule } from "./modules/auth/auth.module";
import { MongooseModuleConfig } from "./config/database.config";
import { LoggerModuleConfig } from "./config/logger.config";
import { UserModule } from "./modules/user/user.module";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import joiConfig from "./config/joi.config";
import { MatchModule } from "./modules/match/match.module";
import { MessageModule } from "./modules/message/message.module";
import { NotFoundController } from "./app.controller";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ZodValidationPipe } from "nestjs-zod";

@Module({
  imports: [
    // Config Module For Loading Environment Variables
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
      validationSchema: joiConfig,
    }),

    // Mongoose Module for MongoDB Connection
    MongooseModuleConfig,

    // Pino Logger for Logging HTTP Requests
    LoggerModuleConfig,

    AuthModule,
    UserModule,
    MatchModule,
    MessageModule,
  ],

  // For Catching 404 Not Found Routes
  controllers: [NotFoundController],

  providers: [
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global Zod Validation Pipe
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
