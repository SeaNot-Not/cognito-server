import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
// import { Logger } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import cookieParser from "cookie-parser";
import configuration from "./config/env.config";

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

  // Access Configured Pino Logger in the App Module
  const logger = app.get(Logger);
  app.useLogger(logger);

  // For activating Zod Validation
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv || "development"}`);
}
bootstrap();
