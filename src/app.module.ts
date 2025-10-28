import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import envConfig from "./config/env.config";
import { AuthModule } from "./auth/auth.module";
import { MongooseConfig } from "./config/database.config";
import { LoggerConfig } from "./config/logger.config";

@Module({
  imports: [
    // Config Module For Loading Environment Variables
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
    }),

    // Mongoose Module for MongoDB Connection
    MongooseConfig,

    // Pino Logger for Logging HTTP Requests
    LoggerConfig,

    AuthModule,
  ],
})
export class AppModule {}
