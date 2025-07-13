import { Module } from "@nestjs/common"
import { TeacherService } from "./teacher.service"
import { TeacherController } from "./teacher.controller"
import { IsPhoneUniqueConstraint } from "./validator/is-phone-unique.validator"

@Module({
  controllers: [TeacherController],
  providers: [TeacherService, IsPhoneUniqueConstraint]
})
export class TeacherModule {}
