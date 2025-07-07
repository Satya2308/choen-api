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

export const rank = pgEnum("rank", [
  "ក.1.1",
  "ក.1.2",
  "ក.1.3",
  "ក.1.4",
  "ក.1.5",
  "ក.1.6",
  "ក.2.1",
  "ក.2.2",
  "ក.2.3",
  "ក.2.4",
  "ក.3.1",
  "ក.3.2",
  "ក.3.3",
  "ក.3.4",
  "ខ.1.1",
  "ខ.1.2",
  "ខ.1.3",
  "ខ.1.4",
  "ខ.1.5",
  "ខ.1.6",
  "ខ.2.1",
  "ខ.2.2",
  "ខ.2.3",
  "ខ.2.4",
  "ខ.3.1",
  "ខ.3.2",
  "ខ.3.3",
  "ខ.3.4",
  "គ.1",
  "គ.2",
  "គ.3",
  "គ.4",
  "គ.5",
  "គ.6",
  "គ.7",
  "គ.8",
  "គ.9"
])

export const teacher = pgTable("teacher", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  gender: gender("gender"),
  dob: date("dob"),
  subject: text("subject"),
  class: text("class"),
  profession: text("profession"),
  krobkan: text("krobkan"),
  rank: rank("rank"),
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
