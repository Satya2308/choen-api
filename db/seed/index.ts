import * as dotenv from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import { seedTimeslots } from "./timeslot"

const { Pool } = pg

dotenv.config()

if (!("DATABASE_URL" in process.env))
  throw new Error("DATABASE_URL not found on .env")

export function getConnection() {
  return new Pool({ connectionString: process.env.DATABASE_URL })
}

const main = async () => {
  const client = getConnection()
  const db = drizzle(client)
  await seedTimeslots(db)
}

main()
