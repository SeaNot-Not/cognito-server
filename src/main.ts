import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import cookieParser from "cookie-parser";
import configuration from "./config/env.config";
import { CustomIoAdapter } from "./config/socket.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const { nodeEnv, port, clientUrl } = configuration();

  app.use(cookieParser());

  app.enableCors({
    origin: [clientUrl],
    allowedHeaders: ["Content-Type"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  });

  // Web Socket Adapter
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  // Access Configured Pino Logger in the App Module
  const logger = app.get(Logger);
  app.useLogger(logger);

  await app.listen(port);

  // Logs
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`CORS enabled for: ${clientUrl}`);
  logger.log(`Environment: ${nodeEnv || "development"}`);
}
bootstrap();
