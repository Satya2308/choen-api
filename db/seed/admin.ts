import * as dotenv from "dotenv"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import { user } from "../schema/user"
import bcrypt from "bcrypt"

dotenv.config()

export default async function seedSuperAdmin(db: NodePgDatabase) {
  const phone = process.env.SUPER_ADMIN_PHONE
  const password = process.env.SUPER_ADMIN_PASSWORD
  if (!phone || !password) throw new Error("Phone and Password are required")
  const saltRounds = 10
  const hashPwd = await bcrypt.hash(password, saltRounds)
  const data = { phone, password: hashPwd }
  console.log(">>> seeding super admin ...")
  await db.insert(user).values(data).onConflictDoUpdate({
    target: user.phone,
    set: data
  })
  console.log(">>> seeding super admin done!")
}
