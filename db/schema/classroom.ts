import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { timeslot, year } from "./year"
import { teacher } from "./teacher"
import { relations } from "drizzle-orm"

export const classroom = pgTable("classroom", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  yearId: integer("yearId")
    .references(() => year.id)
    .notNull(),
  leadTeacherId: integer("leadTeacherId")
    .references(() => teacher.id)
    .notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const classesRelations = relations(classroom, ({ one, many }) => ({
  year: one(year, {
    fields: [classroom.yearId],
    references: [year.id]
  }),
  leadTeacher: one(teacher, {
    fields: [classroom.leadTeacherId],
    references: [teacher.id]
  }),
  assignments: many(classAssignment)
}))

export const classAssignment = pgTable("classAssignment", {
  id: serial("id").primaryKey(),
  classroomId: integer("classroomId")
    .references(() => classroom.id)
    .notNull(),
  teacherId: integer("teacherId").references(() => teacher.id),
  timeslotId: integer("timeslotId")
    .references(() => timeslot.id)
    .notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
})

export const classAssignmentsRelations = relations(
  classAssignment,
  ({ one }) => ({
    classroom: one(classroom, {
      fields: [classAssignment.classroomId],
      references: [classroom.id]
    }),
    teacher: one(teacher, {
      fields: [classAssignment.teacherId],
      references: [teacher.id]
    }),
    timeslot: one(timeslot, {
      fields: [classAssignment.timeslotId],
      references: [timeslot.id]
    })
  })
)
