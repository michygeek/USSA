CREATE TYPE "public"."course_category" AS ENUM('military', 'lawEnforcement', 'corrections', 'security', 'safety');--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "category" "course_category";--> statement-breakpoint
UPDATE "courses" SET "category" = 'security' WHERE "category" IS NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "category" SET NOT NULL;