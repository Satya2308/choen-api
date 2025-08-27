import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res
} from "@nestjs/common"
import { ClassroomService } from "./classroom.service"
import { CreateClassroomDto } from "./dto/create-classroom.dto"
import { UpdateClassroomDto } from "./dto/update-classroom.dto"
import { AssignTeacherDto } from "./dto/assign-teacher.dto"
import { AuthGuard } from "@nestjs/passport"
import { Response } from "express"

@UseGuards(AuthGuard("jwt"))
@Controller("years/:yearId/classrooms")
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  async create(@Body() createClassroomDto: CreateClassroomDto) {
    return await this.classroomService.create(createClassroomDto)
  }

  @Post(":id/assign-teacher")
  async assignTeacher(
    @Param("id") id: string,
    @Body() assignTeacherDto: AssignTeacherDto
  ) {
    return await this.classroomService.assignTeacher(+id, assignTeacherDto)
  }

  @Get()
  async findAll(@Param("yearId") yearId: string) {
    return await this.classroomService.findAll(+yearId)
  }

  @Get(":id/timetable")
  async findTimetable(@Param("id") id: string) {
    return await this.classroomService.findTimetable(+id)
  }

  @Get(":id/export")
  async exportTimetable(@Param("id") id: number, @Res() res: Response) {
    const buffer = await this.classroomService.exportTimetableToExcel(id)
    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment",
      "Content-Length": buffer.length
    })
    res.send(buffer)
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.classroomService.findOne(+id)
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateClassroomDto: UpdateClassroomDto
  ) {
    return await this.classroomService.update(+id, updateClassroomDto)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.classroomService.remove(+id)
  }
}
