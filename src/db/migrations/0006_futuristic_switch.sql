ALTER TABLE "classAssignment" DROP CONSTRAINT "classAssignment_classroomId_classroom_id_fk";
--> statement-breakpoint
ALTER TABLE "classAssignment" DROP CONSTRAINT "classAssignment_teacherId_teacher_id_fk";
--> statement-breakpoint
ALTER TABLE "classAssignment" DROP CONSTRAINT "classAssignment_timeslotId_timeslot_id_fk";
--> statement-breakpoint
ALTER TABLE "classroom" DROP CONSTRAINT "classroom_yearId_year_id_fk";
--> statement-breakpoint
ALTER TABLE "classroom" DROP CONSTRAINT "classroom_leadTeacherId_teacher_id_fk";
--> statement-breakpoint
ALTER TABLE "classAssignment" ALTER COLUMN "teacherId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "classroom" ALTER COLUMN "leadTeacherId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_classroomId_classroom_id_fk" FOREIGN KEY ("classroomId") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_teacherId_teacher_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classAssignment" ADD CONSTRAINT "classAssignment_timeslotId_timeslot_id_fk" FOREIGN KEY ("timeslotId") REFERENCES "public"."timeslot"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_yearId_year_id_fk" FOREIGN KEY ("yearId") REFERENCES "public"."year"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_leadTeacherId_teacher_id_fk" FOREIGN KEY ("leadTeacherId") REFERENCES "public"."teacher"("id") ON DELETE set null ON UPDATE cascade;