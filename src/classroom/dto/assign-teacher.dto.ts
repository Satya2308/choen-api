import { IsIn, IsNumber, IsOptional } from "class-validator"

export enum ACTION {
  ASSIGN = "ASSIGN",
  REMOVE = "REMOVE"
}

export class AssignTeacherDto {
  @IsNumber()
  timeslotId: number

  @IsNumber()
  classroomId: number

  @IsOptional()
  @IsNumber()
  teacherId: number

  @IsIn([ACTION.ASSIGN, ACTION.REMOVE])
  action: ACTION
}
