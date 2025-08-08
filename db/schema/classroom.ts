import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique
} from "drizzle-orm/pg-core"
import { timeslot, year } from "./year"
import { teacher } from "./teacher"
import { relations } from "drizzle-orm"

export const classroom = pgTable("classroom", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  yearId: integer("yearId")
    .references(() => year.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
  leadTeacherId: integer("leadTeacherId").references(() => teacher.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
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

export const classAssignment = pgTable(
  "classAssignment",
  {
    id: serial("id").primaryKey(),
    classroomId: integer("classroomId")
      .references(() => classroom.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      })
      .notNull(),
    teacherId: integer("teacherId")
      .references(() => teacher.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      })
      .notNull(),
    timeslotId: integer("timeslotId")
      .references(() => timeslot.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
      })
      .notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").$onUpdateFn(() => new Date())
  },
  table => ({
    classroomTimeslotUnique: unique().on(table.classroomId, table.timeslotId)
  })
)

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
