import { Inject, Injectable } from "@nestjs/common"
import { Database } from "src/db/type"
import * as schema from "src/db/schema"
import { eq } from "drizzle-orm"

@Injectable()
export class UsersService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async getByPhone(phone: string) {
    return await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.phone, phone))
      .then(res => res[0])
  }
}
