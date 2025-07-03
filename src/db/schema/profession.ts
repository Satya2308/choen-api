import { relations } from "drizzle-orm"
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { teacher } from "./teacher"

export const profession = pgTable("profession", {
  id: serial("id").primaryKey(),
  first: text("first").notNull(),
  second: text("second"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const professionRelations = relations(profession, ({ many }) => ({
  teachers: many(teacher)
}))
