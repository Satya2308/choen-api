import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { TeacherModule } from "./teacher/teacher.module"
import { DatabaseModule } from "./database.module"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    TeacherModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
