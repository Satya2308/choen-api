import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { AccessToken } from "./type"
import { Request } from "express"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.accessToken
        }
      ]),
      secretOrKey: configService.get("JWT_ACCESS_SECRET")!
    })
  }

  async validate(payload: AccessToken) {
    return { userId: payload.sub, phone: payload.phone }
  }
}
