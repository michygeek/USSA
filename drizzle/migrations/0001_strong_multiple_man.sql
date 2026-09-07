CREATE TYPE "public"."lesson_content_type" AS ENUM('video', 'pdf');--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "content_type" "lesson_content_type" DEFAULT 'video' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "pdf_storage_path" text;