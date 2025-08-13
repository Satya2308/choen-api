import { ForbiddenException, Inject, Injectable } from "@nestjs/common"
import { UsersService } from "../users/users.service"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { ConfigService } from "@nestjs/config"
import { LoginInput, ValidateUserInput } from "./type"
import { Database } from "db/type"
import * as schema from "db/schema"
import { eq } from "drizzle-orm"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject("DATABASE_CONNECTION") private db: Database
  ) {}

  async validateUser(props: ValidateUserInput) {
    const { phone, password } = props
    console.log("phone", phone)
    console.log("password", password)
    const user = await this.usersService.getByPhone(phone)
    if (user && (await bcrypt.compare(password, user.password!))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async getTokens(userId: number, phone: string) {
    const payload = { sub: userId, phone }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: "7d"
      })
    ])
    return { accessToken, refreshToken }
  }

  async login(props: LoginInput) {
    const userDb = schema.user
    const { id, phone } = props
    const tokens = await this.getTokens(id, phone)
    const hashed = await bcrypt.hash(tokens.refreshToken, 10)
    await this.db
      .update(userDb)
      .set({ refreshToken: hashed })
      .where(eq(userDb.id, id))
    return tokens
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const userDb = schema.user
    await this.db
      .update(userDb)
      .set({ refreshToken })
      .where(eq(userDb.id, userId))
  }

  async refreshTokens(userId: number, currentRefreshToken: string) {
    const userDb = schema.user
    const user = await this.db
      .select()
      .from(userDb)
      .where(eq(userDb.id, userId))
      .then(res => res[0])
    if (!user || !user.refreshToken)
      throw new ForbiddenException("Access Denied")
    const refreshMatches = await bcrypt.compare(
      currentRefreshToken,
      user.refreshToken
    )
    if (!refreshMatches) throw new ForbiddenException("Refresh token mismatch") // possible theft
    const tokens = await this.getTokens(userId, user.phone)
    const hashed = await bcrypt.hash(tokens.refreshToken, 10)
    await this.updateRefreshToken(userId, hashed)
    return tokens
  }

  async clearRefreshToken(userId: number) {
    const userDb = schema.user
    await this.db
      .update(userDb)
      .set({ refreshToken: null })
      .where(eq(userDb.id, userId))
  }
}
