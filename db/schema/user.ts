import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { teacher } from "./teacher"

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  password: text("password"),
  refreshToken: text("refreshToken"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const userRelations = relations(user, ({ one }) => ({
  teacher: one(teacher, {
    fields: [user.id],
    references: [teacher.userId]
  })
}))
