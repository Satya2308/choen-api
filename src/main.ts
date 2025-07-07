import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 🌐 Global Pipe applied here
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that are not in DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true // Automatically convert types
      }
    })
  )

  await app.listen(3000)
}
bootstrap()
