import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { CreateTeacherDto } from "./dto/create-teacher.dto"
import { UpdateTeacherDto } from "./dto/update-teacher.dto"
import { Database } from "db/type"
import * as schema from "db/schema"
import { eq, getTableColumns } from "drizzle-orm"

@Injectable()
export class TeacherService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async create(createTeacherDto: CreateTeacherDto) {
    const userSchema = schema.user
    const teacherSchema = schema.teacher
    const { phone, ...data } = createTeacherDto
    const user = await this.db.insert(userSchema).values({ phone }).returning()
    const param = { ...data, userId: user[0].id }
    await this.db
      .insert(teacherSchema)
      .values(param)
      .returning()
      .then(res => res[0])
    return { message: "Teacher created successfully" }
  }

  async findAll() {
    const teacherSchema = schema.teacher
    const userSchema = schema.user
    return await this.db
      .select({
        ...getTableColumns(teacherSchema),
        phone: userSchema.phone
      })
      .from(teacherSchema)
      .leftJoin(userSchema, eq(userSchema.id, teacherSchema.userId))
  }

  async findOne(id: number) {
    const teacherSchema = schema.teacher
    const userSchema = schema.user
    const teacher = await this.db
      .select({
        ...getTableColumns(teacherSchema),
        phone: userSchema.phone
      })
      .from(teacherSchema)
      .where(eq(teacherSchema.id, id))
      .leftJoin(userSchema, eq(userSchema.id, teacherSchema.userId))
      .then(res => res[0])
    if (!teacher) throw new NotFoundException(`Teacher with ID ${id} not found`)
    return teacher
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    const userSchema = schema.user
    const teacherSchema = schema.teacher
    const { phone, ...data } = updateTeacherDto
    const teacher = await this.db
      .select()
      .from(teacherSchema)
      .where(eq(teacherSchema.id, id))
      .then(res => res[0])
    const userId = teacher.userId
    if (userId && phone) {
      await this.db
        .update(userSchema)
        .set({ phone })
        .where(eq(userSchema.id, userId))
        .returning()
    }
    await this.db
      .update(teacherSchema)
      .set(data)
      .where(eq(teacherSchema.id, id))
    return { message: "Teacher updated successfully" }
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`
  }
}
