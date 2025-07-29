import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core"
import { classAssignment } from "./classroom"
import { relations } from "drizzle-orm"

export const durationEnum = pgEnum("duration", ["1_hour", "1_5_hour"])

export const timeslot = pgTable("timeslot", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  duration: durationEnum("duration").notNull(),
  sortOrder: integer("sortOrder").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const timeSlotsRelations = relations(timeslot, ({ many }) => ({
  assignments: many(classAssignment)
}))
