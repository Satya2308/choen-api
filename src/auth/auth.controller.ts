import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { Response } from "express"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.authService.validateUser(dto)
    if (!user) throw new UnauthorizedException("Invalid credentials")
    const { accessToken, refreshToken } = await this.authService.login(user)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return { accessToken }
  }
}
