import { Inject, Injectable } from "@nestjs/common"
import { CreateClassroomDto } from "./dto/create-classroom.dto"
import { UpdateClassroomDto } from "./dto/update-classroom.dto"
import * as schema from "db/schema"
import { Database } from "db/type"
import { and, eq, sql } from "drizzle-orm"
import { AssignTeacherDto } from "./dto/assign-teacher.dto"
import { TimeslotWithAssignments } from "./type"

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
    const { timeslotId, teacherId, action, day } = assignTeacherDto
    const classAssignmentDb = schema.classAssignment
    if (action === "REMOVE" || !teacherId) {
      await this.db
        .delete(classAssignmentDb)
        .where(
          and(
            eq(classAssignmentDb.classroomId, classroomId),
            eq(classAssignmentDb.timeslotId, timeslotId),
            eq(classAssignmentDb.day, day)
          )
        )
      return { message: "Assignment removed" }
    }
    await this.db
      .insert(classAssignmentDb)
      .values({ classroomId, timeslotId, teacherId, day })
      .onConflictDoUpdate({
        target: [
          classAssignmentDb.classroomId,
          classAssignmentDb.timeslotId,
          classAssignmentDb.day
        ],
        set: { teacherId, updatedAt: new Date() }
      })
    return { message: "Teacher assigned successfully" }
  }

  async findAll(yearId: number) {
    const classroomSchema = schema.classroom
    const teacherSchema = schema.teacher
    return await this.db
      .select({
        id: classroomSchema.id,
        name: classroomSchema.name,
        teacher: {
          id: teacherSchema.id,
          name: schema.teacher.name,
          code: teacherSchema.code
        }
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
        teacher: {
          id: teacherSchema.id,
          name: schema.teacher.name,
          code: schema.teacher.code
        }
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

  async getDuration(classroomId: number) {
    const classroomDb = schema.classroom
    const yearDb = schema.year
    return this.db
      .select({ classDuration: yearDb.classDuration })
      .from(classroomDb)
      .innerJoin(yearDb, eq(yearDb.id, classroomDb.yearId))
      .where(eq(classroomDb.id, classroomId))
      .limit(1)
      .then(res => res[0])
  }

  async findTimetable(classroomId: number): Promise<TimeslotWithAssignments[]> {
    const duration = await this.getDuration(classroomId)
    if (!duration) throw new Error("Classroom not found")
    const result = await this.db.execute(sql<TimeslotWithAssignments[]>`
    SELECT 
      ts.id,
      ts.label,
      ts.duration,
      ts."sortOrder" AS "sortOrder",
      json_build_object(
        'monday', json_build_object('teacher', 
          CASE WHEN ca_mon."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_mon."teacherId", 'name', t_mon.name, 'code', t_mon.code) 
          ELSE null END
        ),
        'tuesday', json_build_object('teacher', 
          CASE WHEN ca_tue."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_tue."teacherId", 'name', t_tue.name, 'code', t_tue.code) 
          ELSE null END
        ),
        'wednesday', json_build_object('teacher', 
          CASE WHEN ca_wed."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_wed."teacherId", 'name', t_wed.name, 'code', t_wed.code) 
          ELSE null END
        ),
        'thursday', json_build_object('teacher', 
          CASE WHEN ca_thu."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_thu."teacherId", 'name', t_thu.name, 'code', t_thu.code) 
          ELSE null END
        ),
        'friday', json_build_object('teacher', 
          CASE WHEN ca_fri."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_fri."teacherId", 'name', t_fri.name, 'code', t_fri.code) 
          ELSE null END
        ),
        'saturday', json_build_object('teacher', 
          CASE WHEN ca_sat."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_sat."teacherId", 'name', t_sat.name, 'code', t_sat.code) 
          ELSE null END
        )
      )::jsonb AS assignments
    FROM timeslot ts
    LEFT JOIN "classAssignment" ca_mon ON ca_mon."timeslotId" = ts.id 
      AND ca_mon."classroomId" = ${classroomId} 
      AND ca_mon.day = 'monday'
    LEFT JOIN teacher t_mon ON t_mon.id = ca_mon."teacherId"
    LEFT JOIN "classAssignment" ca_tue ON ca_tue."timeslotId" = ts.id 
      AND ca_tue."classroomId" = ${classroomId} 
      AND ca_tue.day = 'tuesday'
    LEFT JOIN teacher t_tue ON t_tue.id = ca_tue."teacherId"
    LEFT JOIN "classAssignment" ca_wed ON ca_wed."timeslotId" = ts.id 
      AND ca_wed."classroomId" = ${classroomId} 
      AND ca_wed.day = 'wednesday'
    LEFT JOIN teacher t_wed ON t_wed.id = ca_wed."teacherId"
    LEFT JOIN "classAssignment" ca_thu ON ca_thu."timeslotId" = ts.id 
      AND ca_thu."classroomId" = ${classroomId} 
      AND ca_thu.day = 'thursday'
    LEFT JOIN teacher t_thu ON t_thu.id = ca_thu."teacherId"
    LEFT JOIN "classAssignment" ca_fri ON ca_fri."timeslotId" = ts.id 
      AND ca_fri."classroomId" = ${classroomId} 
      AND ca_fri.day = 'friday'
    LEFT JOIN teacher t_fri ON t_fri.id = ca_fri."teacherId"
    LEFT JOIN "classAssignment" ca_sat ON ca_sat."timeslotId" = ts.id 
      AND ca_sat."classroomId" = ${classroomId} 
      AND ca_sat.day = 'saturday'
    LEFT JOIN teacher t_sat ON t_sat.id = ca_sat."teacherId"
    WHERE ts.duration = ${duration.classDuration}
    ORDER BY ts."sortOrder"
  `)
    return result.rows
  }
}
