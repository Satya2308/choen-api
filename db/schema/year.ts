import { relations } from "drizzle-orm"
import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core"
import { classroom } from "./classroom"

export const classDurationEnum = pgEnum("classDuration", ["1_hour", "1_5_hour"])

export const year = pgTable("year", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  classDuration: classDurationEnum("classDuration").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const yearsRelations = relations(year, ({ many }) => ({
  classrooms: many(classroom)
}))
