ALTER TABLE "timeslot" ALTER COLUMN "duration" SET DATA TYPE "public"."classDuration" USING "duration"::text::"public"."classDuration";--> statement-breakpoint
DROP TYPE "public"."duration";