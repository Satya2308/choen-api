import { Inject, Injectable } from "@nestjs/common"
import { CreateTeacherDto } from "./dto/create-teacher.dto"
import { UpdateTeacherDto } from "./dto/update-teacher.dto"
import { Database } from "src/db/type"
import * as schema from "src/db/schema"

@Injectable()
export class TeacherService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async create(createTeacherDto: CreateTeacherDto) {
    const { phone, password, ...data } = createTeacherDto
    const user = await this.db
      .insert(schema.user)
      .values({ phone, password })
      .returning()
    const param = { ...data, userId: user[0].id }
    await this.db.insert(schema.teacher).values(param).returning()
  }

  findAll() {
    return `This action returns all teacher`
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
