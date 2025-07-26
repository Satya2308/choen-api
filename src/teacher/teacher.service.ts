import { Inject, Injectable } from "@nestjs/common"
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
    console.log("phone", phone)
    console.log("data", data)
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
        user: {
          phone: userSchema.phone,
          password: userSchema.password
        }
      })
      .from(teacherSchema)
      .leftJoin(userSchema, eq(userSchema.id, teacherSchema.userId))
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`
  }

  remove(id: number) {
    return `This action removes a #${id} teacher`
  }
}
