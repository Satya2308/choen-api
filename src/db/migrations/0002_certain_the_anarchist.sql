CREATE TYPE "public"."classDuration" AS ENUM('1_hour', '1_5_hour');--> statement-breakpoint
CREATE TYPE "public"."duration" AS ENUM('1_hour', '1_5_hour');--> statement-breakpoint
CREATE TABLE "classAssignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"classroomId" integer NOT NULL,
	"teacherId" integer,
	"timeslotId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "classroom" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"yearId" integer NOT NULL,
	"leadTeacherId" integer,
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
CREATE TABLE "timeslot" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"duration" "duration" NOT NULL,
	"sortOrder" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_classroomId_classroom_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classroom"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_teacherId_teacher_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_timeslotId_timeslot_id_fk" FOREIGN KEY ("timeslotId") REFERENCES "public"."timeslot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_yearId_year_id_fk" FOREIGN KEY ("yearId") REFERENCES "public"."year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_leadTeacherId_teacher_id_fk" FOREIGN KEY ("leadTeacherId") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;