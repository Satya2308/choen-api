import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { TeacherModule } from "./teacher/teacher.module"
import { DatabaseModule } from "./database.module"
import { ConfigModule } from "@nestjs/config"
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { YearModule } from './year/year.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    TeacherModule,
    UsersModule,
    AuthModule,
    YearModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
