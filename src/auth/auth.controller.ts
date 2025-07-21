import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto)
    if (!user) throw new UnauthorizedException("Invalid credentials")
    return this.authService.login(user)
  }
}
