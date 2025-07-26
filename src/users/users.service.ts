import { Inject, Injectable } from "@nestjs/common"
import { Database } from "db/type"
import * as schema from "db/schema"
import { eq, isNotNull, and } from "drizzle-orm"

@Injectable()
export class UsersService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async getByPhone(phone: string) {
    const userSchema = schema.user
    return await this.db
      .select()
      .from(schema.user)
      .where(and(eq(userSchema.phone, phone), isNotNull(userSchema.password)))
      .then(res => res[0])
  }
}
