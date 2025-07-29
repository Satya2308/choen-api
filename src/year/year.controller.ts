import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from "@nestjs/common"
import { YearService } from "./year.service"
import { CreateYearDto } from "./dto/create-year.dto"
import { UpdateYearDto } from "./dto/update-year.dto"

@Controller("years")
export class YearController {
  constructor(private readonly yearService: YearService) {}

  @Post()
  async create(@Body() createYearDto: CreateYearDto) {
    return await this.yearService.create(createYearDto)
  }

  @Get()
  async findAll() {
    return await this.yearService.findAll()
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.yearService.findOne(+id)
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateYearDto: UpdateYearDto) {
    return await this.yearService.update(+id, updateYearDto)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.yearService.remove(+id)
  }
}
