import { Injectable } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { ConfigService } from "@nestjs/config"
import { LoginInput, ValidateUserInput } from "./type"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(props: ValidateUserInput) {
    const { phone, password } = props
    const user = await this.usersService.getByPhone(phone)
    if (user && (await bcrypt.compare(password, user.password!))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(props: LoginInput) {
    const { id, phone } = props
    const payload = { id: id, phone: phone }
    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: "7d"
    })
    return { accessToken, refreshToken }
  }
}
