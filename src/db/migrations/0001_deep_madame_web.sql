CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TABLE "krobkan" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "profession" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "rank" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "schoolClass" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
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
ALTER TABLE "teachers" RENAME TO "teacher";--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "dob" date;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "subjectId" integer;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "schoolClassId" integer;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "professionId" integer;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "krobkanId" integer;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "rankId" integer;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_subjectId_subject_id_fk" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_schoolClassId_schoolClass_id_fk" FOREIGN KEY ("schoolClassId") REFERENCES "public"."schoolClass"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_professionId_profession_id_fk" FOREIGN KEY ("professionId") REFERENCES "public"."profession"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_krobkanId_krobkan_id_fk" FOREIGN KEY ("krobkanId") REFERENCES "public"."krobkan"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_rankId_rank_id_fk" FOREIGN KEY ("rankId") REFERENCES "public"."rank"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_code_unique" UNIQUE("code");