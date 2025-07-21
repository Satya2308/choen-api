import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import * as schema from "../db/schema"

export type User = InferSelectModel<typeof schema.user>

export type LoginInput = Omit<User, "password">

export type UserInput = InferInsertModel<typeof schema.user>

export type ValidateUserInput = Pick<UserInput, "phone" | "password">

export type AccessToken = Pick<User, "id" | "phone">
