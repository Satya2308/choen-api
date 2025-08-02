import { Inject, Injectable } from "@nestjs/common"
import { CreateClassroomDto } from "./dto/create-classroom.dto"
import { UpdateClassroomDto } from "./dto/update-classroom.dto"
import * as schema from "db/schema"
import { Database } from "db/type"
import { eq, getTableColumns, sql } from "drizzle-orm"

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
      .innerJoin(
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
        name: classroomSchema.name,
        teacher: { id: teacherSchema.id, name: schema.teacher.name }
      })
      .from(classroomSchema)
      .innerJoin(
        teacherSchema,
        eq(classroomSchema.leadTeacherId, teacherSchema.id)
      )
      .where(eq(classroomSchema.id, id))
      .then(res => res[0])
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto) {
    const { name, leadTeacherId, yearId } = updateClassroomDto
    const classroomSchema = schema.classroom
    const ok = await this.db
      .update(classroomSchema)
      .set(updateClassroomDto)
      .where(eq(classroomSchema.id, id))
      .returning()
      .then(res => res[0])
  }

  async remove(id: number) {
    const classroomSchema = schema.classroom
    return await this.db
      .delete(classroomSchema)
      .where(eq(classroomSchema.id, id))
      .returning()
      .then(res => res[0])
  }
}
