import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./user"

export const gender = pgEnum("gender", ["MALE", "FEMALE"])

export const teacher = pgTable("teacher", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  gender: gender("gender"),
  dob: date("dob"),
  subject: text("subject"),
  classroom: text("classroom"),
  profession: text("profession"),
  profession1: text("profession1"),
  krobkan: text("krobkan"),
  rank: text("rank"),
  userId: integer("userId").references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const teacherRelations = relations(teacher, ({ one }) => ({
  user: one(user, {
    fields: [teacher.userId],
    references: [user.id]
  })
}))
