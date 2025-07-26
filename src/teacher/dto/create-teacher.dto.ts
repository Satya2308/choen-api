import { IsString, IsOptional, IsIn, IsDateString } from "class-validator"
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

  @IsString()
  @IsPhoneUnique({ message: "លេខទូរស័ព្ទនេះមាននៅក្នុងប្រព័ន្ធរួចហើយ" })
  phone: string

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
  profession1?: string

  @IsOptional()
  @IsString()
  profession2?: string

  @IsOptional()
  @IsString()
  krobkan?: string

  @IsOptional()
  @IsString()
  rank?: string
}
