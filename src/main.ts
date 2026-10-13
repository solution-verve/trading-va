import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import * as cors from "cors";
import { GlobalExceptionFilter } from "./common/globalException.filters";
dotenv.config(); // Load environment variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  app.use(
    cors({
      origin: true, // Allows requests from any origin
      methods: "GET,POST,PUT,DELETE,OPTIONS",
      allowedHeaders: "Content-Type, Authorization",
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(3010);
}
bootstrap();
