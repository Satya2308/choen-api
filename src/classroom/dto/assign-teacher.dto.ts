import { IsIn, IsNumber, IsOptional } from "class-validator"

export enum ACTION {
  ASSIGN = "ASSIGN",
  REMOVE = "REMOVE"
}

export enum DAY {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday"
}

export class AssignTeacherDto {
  @IsNumber()
  timeslotId: number

  @IsNumber()
  classroomId: number

  @IsIn([DAY.MONDAY, DAY.TUESDAY, DAY.WEDNESDAY, DAY.THURSDAY, DAY.FRIDAY, DAY.SATURDAY])
  day: DAY

  @IsOptional()
  @IsNumber()
  teacherId: number

  @IsIn([ACTION.ASSIGN, ACTION.REMOVE])
  action: ACTION
}
