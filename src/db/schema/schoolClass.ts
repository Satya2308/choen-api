import { relations } from "drizzle-orm"
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { teacher } from "./teacher"

export const schoolClass = pgTable("schoolClass", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const schoolClassRelations = relations(schoolClass, ({ many }) => ({
  teachers: many(teacher)
}))
