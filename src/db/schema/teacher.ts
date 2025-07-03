import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core"
import { schoolClass } from "./schoolClass"
import { relations } from "drizzle-orm"
import { subject } from "./subject"
import { profession } from "./profession"
import { user } from "./user"
import { krobkan } from "./krobkan"
import { rank } from "./rank"

export const gender = pgEnum("gender", ["MALE", "FEMALE"])

export const teacher = pgTable("teacher", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  gender: gender("gender"),
  dob: date("dob"),
  userId: integer("userId").references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  subjectId: integer("subjectId").references(() => subject.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  schoolClassId: integer("schoolClassId").references(() => schoolClass.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  professionId: integer("professionId").references(() => profession.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  krobkanId: integer("krobkanId").references(() => krobkan.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  rankId: integer("rankId").references(() => rank.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const teacherRelations = relations(teacher, ({ one }) => ({
  user: one(user, {
    fields: [teacher.userId],
    references: [user.id]
  }),
  schoolClass: one(schoolClass, {
    fields: [teacher.schoolClassId],
    references: [schoolClass.id]
  }),
  subject: one(subject, {
    fields: [teacher.subjectId],
    references: [subject.id]
  }),
  profession: one(profession, {
    fields: [teacher.professionId],
    references: [profession.id]
  }),
  krobkan: one(krobkan, {
    fields: [teacher.krobkanId],
    references: [krobkan.id]
  }),
  rank: one(rank, {
    fields: [teacher.rankId],
    references: [rank.id]
  })
}))
