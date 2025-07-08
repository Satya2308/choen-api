import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const pool = new Pool({ connectionString: "dummy" })
const db = drizzle(pool, { schema })

export type DbClient = typeof db
