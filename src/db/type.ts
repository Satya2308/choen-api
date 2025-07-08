import { NodePgDatabase } from "drizzle-orm/node-postgres"
import schema from "./schema"

export type Database = NodePgDatabase<typeof schema>
