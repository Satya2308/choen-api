import { IsNumber, IsString } from "class-validator"

export class CreateClassroomDto {
  @IsString()
  name: string

  @IsNumber()
  yearId: number

  @IsNumber()
  leadTeacherId: number
}
