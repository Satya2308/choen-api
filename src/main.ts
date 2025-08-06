import { BadRequestException, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { useContainer, ValidationError } from "class-validator"
import cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: "http://localhost:5173", // your Remix app
    credentials: true
  })

  app.use(cookieParser())

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // 🌐 Global Pipe applied here
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that are not in DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true // Automatically convert types
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors: Record<string, string[]> = {}
        for (const error of errors) {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints)
          }
        }
        throw new BadRequestException({
          statusCode: 400,
          message: formattedErrors,
          error: "Bad Request"
        })
      }
    })
  )

  await app.listen(3000)
}
bootstrap()
