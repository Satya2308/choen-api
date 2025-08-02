import { IsString, IsInt, Min } from "class-validator"

export class SearchTeacherDto {
  @IsString()
  q: string

  @IsInt()
  @Min(1)
  limit: number = 20
}
