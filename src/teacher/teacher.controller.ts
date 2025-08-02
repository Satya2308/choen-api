import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query
} from "@nestjs/common"
import { TeacherService } from "./teacher.service"
import { CreateTeacherDto } from "./dto/create-teacher.dto"
import { UpdateTeacherDto } from "./dto/update-teacher.dto"
import { SearchTeacherDto } from "./dto/search-teacher.dto"

@Controller("teachers")
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    return await this.teacherService.create(createTeacherDto)
  }

  @Get()
  async findAll() {
    return await this.teacherService.findAll()
  }

  @Get("search")
  async searchTeachers(@Query() query: SearchTeacherDto) {
    return await this.teacherService.searchTeachers(query.q, query.limit)
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.teacherService.findOne(+id)
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateTeacherDto: UpdateTeacherDto
  ) {
    return await this.teacherService.update(+id, updateTeacherDto)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.teacherService.remove(+id)
  }
}
