CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."rank" AS ENUM('ក.1.1', 'ក.1.2', 'ក.1.3', 'ក.1.4', 'ក.1.5', 'ក.1.6', 'ក.2.1', 'ក.2.2', 'ក.2.3', 'ក.2.4', 'ក.3.1', 'ក.3.2', 'ក.3.3', 'ក.3.4', 'ខ.1.1', 'ខ.1.2', 'ខ.1.3', 'ខ.1.4', 'ខ.1.5', 'ខ.1.6', 'ខ.2.1', 'ខ.2.2', 'ខ.2.3', 'ខ.2.4', 'ខ.3.1', 'ខ.3.2', 'ខ.3.3', 'ខ.3.4', 'គ.1', 'គ.2', 'គ.3', 'គ.4', 'គ.5', 'គ.6', 'គ.7', 'គ.8', 'គ.9');--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"gender" "gender",
	"dob" date,
	"subject" text,
	"class" text,
	"profession" text,
	"krobkan" text,
	"rank" "rank",
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "teacher_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"password" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;