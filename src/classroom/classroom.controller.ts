import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from "@nestjs/common"
import { ClassroomService } from "./classroom.service"
import { CreateClassroomDto } from "./dto/create-classroom.dto"
import { UpdateClassroomDto } from "./dto/update-classroom.dto"

@Controller("years/:yearId/classrooms")
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  async create(@Body() createClassroomDto: CreateClassroomDto) {
    return await this.classroomService.create(createClassroomDto)
  }

  @Get()
  async findAll(@Param("yearId") yearId: string) {
    return await this.classroomService.findAll(+yearId)
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
