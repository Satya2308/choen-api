import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  UseGuards,
  Get,
  Req
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { Request, Response } from "express"
import { AuthGuard } from "@nestjs/passport"
import { ConfigService } from "@nestjs/config"

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  getMe(@Req() req: Request) {
    return req.user
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.authService.validateUser(dto)
    const errorMsg = "លេខទូរស័ព្ទឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។"
    if (!user) throw new UnauthorizedException(errorMsg)
    const { accessToken, refreshToken } = await this.authService.login(user)
    const isProd = this.configService.get("NODE_ENV") === "production"
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/auth/refresh"
    })
    return { message: "Login successful" }
  }
}
