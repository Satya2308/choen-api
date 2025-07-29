import { IsBoolean, IsIn, IsString } from "class-validator"

export enum ClassDuration {
  OneHour = "1_hour",
  OneAndAHalfHours = "1_5_hour"
}

export class CreateYearDto {
  @IsString()
  name: string

  @IsIn([ClassDuration.OneHour, ClassDuration.OneAndAHalfHours])
  classDuration: ClassDuration

  @IsBoolean()
  isActive: boolean = true
}
