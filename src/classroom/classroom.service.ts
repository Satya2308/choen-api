import { Inject, Injectable } from "@nestjs/common"
import { CreateClassroomDto } from "./dto/create-classroom.dto"
import { UpdateClassroomDto } from "./dto/update-classroom.dto"
import * as schema from "db/schema"
import { Database } from "db/type"
import { and, eq, sql } from "drizzle-orm"
import { AssignTeacherDto } from "./dto/assign-teacher.dto"

@Injectable()
export class ClassroomService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async create(createClassroomDto: CreateClassroomDto) {
    const classroomSchema = schema.classroom
    return await this.db
      .insert(classroomSchema)
      .values(createClassroomDto)
      .returning()
      .then(res => res[0])
  }

  async assignTeacher(classroomId: number, assignTeacherDto: AssignTeacherDto) {
    const { timeslotId, teacherId, action } = assignTeacherDto
    const classAssignmentDb = schema.classAssignment
    if (action === "REMOVE" || !teacherId) {
      await this.db
        .delete(classAssignmentDb)
        .where(
          and(
            eq(classAssignmentDb.classroomId, classroomId),
            eq(classAssignmentDb.timeslotId, timeslotId)
          )
        )
      return { message: "Assignment removed" }
    }
    await this.db
      .insert(classAssignmentDb)
      .values({ classroomId, timeslotId, teacherId })
      .onConflictDoUpdate({
        target: [classAssignmentDb.classroomId, classAssignmentDb.timeslotId],
        set: { teacherId, updatedAt: new Date() }
      })
    return { message: "Teacher assigned successfully" }
  }

  async findAll(yearId: number) {
    const classroomSchema = schema.classroom
    const teacherSchema = schema.teacher
    const timeslotSchema = schema.timeslot
    const yearSchema = schema.year
    const classAssignmentSchema = schema.classAssignment
    return await this.db
      .select({
        id: classroomSchema.id,
        name: classroomSchema.name,
        teacher: { id: teacherSchema.id, name: teacherSchema.name },
        assignedTimeslots: sql<number>`(
          SELECT COUNT(*) 
          FROM ${classAssignmentSchema} 
          WHERE ${classAssignmentSchema.classroomId} = ${classroomSchema.id}
        )`,
        totalTimeslots: sql<number>`(
          SELECT COUNT(*) FROM ${timeslotSchema} 
          WHERE ${timeslotSchema.duration} = (
            SELECT ${yearSchema.classDuration} 
            FROM ${yearSchema} 
            WHERE ${yearSchema.id} = ${yearId}
         )
        )`
      })
      .from(classroomSchema)
      .leftJoin(
        teacherSchema,
        eq(classroomSchema.leadTeacherId, teacherSchema.id)
      )
      .where(eq(classroomSchema.yearId, yearId))
  }

  async findOne(id: number) {
    const classroomSchema = schema.classroom
    const teacherSchema = schema.teacher
    return await this.db
      .select({
        id: classroomSchema.id,
        name: classroomSchema.name,
        teacher: { id: teacherSchema.id, name: schema.teacher.name }
      })
      .from(classroomSchema)
      .leftJoin(
        teacherSchema,
        eq(classroomSchema.leadTeacherId, teacherSchema.id)
      )
      .where(eq(classroomSchema.id, id))
      .then(res => res[0])
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto) {
    const classroomSchema = schema.classroom
    await this.db
      .update(classroomSchema)
      .set(updateClassroomDto)
      .where(eq(classroomSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ទិន្នន័យថ្នាក់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ" }
  }

  async remove(id: number) {
    const classroomSchema = schema.classroom
    await this.db
      .delete(classroomSchema)
      .where(eq(classroomSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ទិន្នន័យថ្នាក់ត្រូវបានលុបដោយជោគជ័យ" }
  }

  async findTimeslots(classroomId: number) {
    const classroomDb = schema.classroom
    const yearDb = schema.year
    const timeslotDb = schema.timeslot
    const teacherDb = schema.teacher
    const classAssignmentDb = schema.classAssignment
    const duration = await this.db
      .select({ classDuration: yearDb.classDuration })
      .from(classroomDb)
      .innerJoin(yearDb, eq(classroomDb.yearId, yearDb.id))
      .where(eq(classroomDb.id, classroomId))
      .limit(1)
      .then(res => res[0])
    if (!duration) throw new Error("Classroom not found")
    const timeslots = await this.db
      .select({
        id: timeslotDb.id,
        label: timeslotDb.label,
        duration: timeslotDb.duration,
        sortOrder: timeslotDb.sortOrder,
        teacher: {
          id: teacherDb.id,
          name: teacherDb.name
        }
      })
      .from(timeslotDb)
      .leftJoin(
        classAssignmentDb,
        and(
          eq(classAssignmentDb.classroomId, classroomId),
          eq(classAssignmentDb.timeslotId, timeslotDb.id)
        )
      )
      .leftJoin(teacherDb, eq(teacherDb.id, classAssignmentDb.teacherId))
      .where(eq(timeslotDb.duration, duration.classDuration))
      .orderBy(timeslotDb.sortOrder)
    return timeslots
  }
}
