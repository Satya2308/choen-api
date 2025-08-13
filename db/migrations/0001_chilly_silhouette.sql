CREATE TYPE "public"."day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');--> statement-breakpoint
ALTER TABLE "classAssignment" DROP CONSTRAINT "classAssignment_classroomId_timeslotId_unique";--> statement-breakpoint
ALTER TABLE "classAssignment" ADD COLUMN "day" "day" NOT NULL;--> statement-breakpoint
ALTER TABLE "teacher" ADD COLUMN "profession2" text;--> statement-breakpoint
ALTER TABLE "teacher" DROP COLUMN "profession";--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_classroomId_day_timeslotId_unique" UNIQUE("classroomId","day","timeslotId");