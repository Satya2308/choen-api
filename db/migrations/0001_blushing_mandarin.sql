ALTER TABLE "classAssignment" DROP CONSTRAINT "classAssignment_classroomId_day_timeslotId_unique";--> statement-breakpoint
ALTER TABLE "classAssignment" ADD COLUMN "yearId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_yearId_year_id_fk" FOREIGN KEY ("yearId") REFERENCES "public"."year"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_classroomId_day_timeslotId_yearId_unique" UNIQUE("classroomId","day","timeslotId","yearId");