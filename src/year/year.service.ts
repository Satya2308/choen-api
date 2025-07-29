import { Inject, Injectable } from "@nestjs/common"
import { CreateYearDto } from "./dto/create-year.dto"
import { UpdateYearDto } from "./dto/update-year.dto"
import * as schema from "db/schema"
import { Database } from "db/type"
import { eq } from "drizzle-orm"

@Injectable()
export class YearService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async create(createYearDto: CreateYearDto) {
    const yearSchema = schema.year
    return await this.db
      .insert(yearSchema)
      .values(createYearDto)
      .returning()
      .then(res => res[0])
  }

  async findAll() {
    const yearSchema = schema.year
    return await this.db.select().from(yearSchema)
  }

  async findOne(id: number) {
    const yearSchema = schema.year
    return await this.db
      .select()
      .from(yearSchema)
      .where(eq(yearSchema.id, id))
      .then(res => res[0])
  }

  async update(id: number, updateYearDto: UpdateYearDto) {
    const yearSchema = schema.year
    await this.db
      .update(yearSchema)
      .set(updateYearDto)
      .where(eq(yearSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ឆ្នាំត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ" }
  }

  async remove(id: number) {
    const yearSchema = schema.year
    await this.db
      .delete(yearSchema)
      .where(eq(yearSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ឆ្នាំត្រូវបានលុបដោយជោគជ័យ" }
  }
}
