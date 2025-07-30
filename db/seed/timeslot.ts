import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import data from "./data/timeslot.json"
import { timeslot } from "db/schema"
import { Timeslot } from "./type/timeslot"

export async function seedTimeslots(db: NodePgDatabase) {
  await db.insert(timeslot).values(data as Timeslot[])
}
