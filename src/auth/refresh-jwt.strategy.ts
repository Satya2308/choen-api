import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"
import { RefreshToken } from "./type"

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refreshToken
        }
      ]),
      secretOrKey: configService.get("JWT_REFRESH_SECRET")!
    })
  }

  async validate(payload: RefreshToken) {
    return { userId: payload.sub, phone: payload.phone }
  }
}
