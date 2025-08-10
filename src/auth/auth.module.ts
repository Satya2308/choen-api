import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "../users/users.module"
import { JwtStrategy } from "./jwt.strategy"
import { ConfigService } from "@nestjs/config"
import { RefreshJwtStrategy } from "./refresh-jwt.strategy"

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_ACCESS_SECRET"),
        signOptions: { expiresIn: "15min" }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy]
})
export class AuthModule {}
