import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions
} from "class-validator"
import { Injectable } from "@nestjs/common"
import { Inject } from "@nestjs/common"
import { Database } from "src/db/type"
import { user } from "src/db/schema"
import { eq } from "drizzle-orm"

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPhoneUniqueConstraint implements ValidatorConstraintInterface {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}

  async validate(phone: string, _args: ValidationArguments): Promise<boolean> {
    const existingUser = await this.db.query.user.findFirst({
      where: eq(user.phone, phone)
    })
    return !existingUser
  }

  defaultMessage(_args: ValidationArguments) {
    return "Phone number already exists"
  }
}

export function IsPhoneUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneUniqueConstraint
    })
  }
}
