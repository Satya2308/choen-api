import { relations } from "drizzle-orm"
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { teacher } from "./teacher"

export const krobkan = pgTable("krobkan", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const krobkanRelations = relations(krobkan, ({ many }) => ({
  teachers: many(teacher)
}))
