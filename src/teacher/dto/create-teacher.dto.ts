import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsInt
} from "class-validator"
import { IsPhoneUnique } from "../validator/is-phone-unique.validator"

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE"
}

export class CreateTeacherDto {
  @IsString()
  name: string

  @IsString()
  code: string

  @IsOptional()
  @IsIn([Gender.MALE, Gender.FEMALE])
  gender?: Gender

  @IsOptional()
  @IsDateString()
  dob?: string

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  classroom?: string

  @IsOptional()
  @IsString()
  profession?: string

  @IsOptional()
  @IsString()
  krobkan?: string

  @IsOptional()
  @IsString()
  rank?: string

  @IsOptional()
  @IsInt()
  userId?: number

  @IsString()
  @IsPhoneUnique({ message: "Phone number is already used" })
  phone: string

  @IsString()
  password: string
}
