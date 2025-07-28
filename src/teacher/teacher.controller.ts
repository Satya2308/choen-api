import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from "@nestjs/common"
import { TeacherService } from "./teacher.service"
import { CreateTeacherDto } from "./dto/create-teacher.dto"
import { UpdateTeacherDto } from "./dto/update-teacher.dto"

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

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.teacherService.findOne(+id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    console.log("ok")
    console.log("id", id)
    console.log("updateTeacherDto", updateTeacherDto)
    return this.teacherService.update(+id, updateTeacherDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.teacherService.remove(+id)
  }
}
