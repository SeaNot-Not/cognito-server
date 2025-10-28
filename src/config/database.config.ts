import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule, PinoLogger } from "nestjs-pino";

export const MongooseModuleConfig = MongooseModule.forRootAsync({
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
});
