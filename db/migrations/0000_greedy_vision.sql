CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."classDuration" AS ENUM('1_hour', '1_5_hour');--> statement-breakpoint
CREATE TABLE "classAssignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"classroomId" integer NOT NULL,
	"teacherId" integer NOT NULL,
	"timeslotId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "classAssignment_classroomId_timeslotId_unique" UNIQUE("classroomId","timeslotId")
);
--> statement-breakpoint
CREATE TABLE "classroom" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"yearId" integer NOT NULL,
	"leadTeacherId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"password" text,
	"refreshToken" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"gender" "gender",
	"dob" date,
	"subject" text,
	"profession" text,
	"profession1" text,
	"krobkan" text,
	"rank" text,
	"userId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "teacher_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "timeslot" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"duration" "classDuration" NOT NULL,
	"sortOrder" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "year" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"classDuration" "classDuration" NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_classroomId_classroom_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_teacherId_teacher_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_timeslotId_timeslot_id_fk" FOREIGN KEY ("timeslotId") REFERENCES "public"."timeslot"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_yearId_year_id_fk" FOREIGN KEY ("yearId") REFERENCES "public"."year"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_leadTeacherId_teacher_id_fk" FOREIGN KEY ("leadTeacherId") REFERENCES "public"."teacher"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;