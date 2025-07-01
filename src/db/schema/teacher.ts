import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
})