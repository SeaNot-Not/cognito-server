import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

export const LoggerConfig = LoggerModule.forRootAsync({
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
});
