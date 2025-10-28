import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { AuthModule } from "./auth/auth.module";
import { LoggerModule, PinoLogger } from "nestjs-pino";

@Module({
  imports: [
    // Config Module For Loading Environment Variables
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),

    // Mongoose Module for MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      useFactory: async (configService: ConfigService, logger: PinoLogger) => {
        logger.setContext("MongoDB");

        return {
          uri: configService.get<string>("mongoUri"),
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              logger.info(`Connected to database: ${connection.name}`);
            }

            connection.on("disconnected", () => {
              logger.warn("MongoDB disconnected");
            });

            connection.on("error", (error) => {
              logger.error({ err: error }, "MongoDB connection error");
            });

            return connection;
          },
        };
      },
      inject: [ConfigService, PinoLogger],
    }),

    // Pino Logger for Logging HTTP Requests
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>("nodeEnv");

        return {
          pinoHttp: {
            level: nodeEnv !== "production" ? "debug" : "info",
            transport:
              nodeEnv !== "production"
                ? {
                    target: "pino-pretty",
                    options: {
                      colorize: true,
                      levelFirst: true,
                      translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l",
                    },
                  }
                : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
  ],
})
export class AppModule {}
