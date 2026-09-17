CREATE TABLE IF NOT EXISTS "assessment_attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_choice_id" uuid,
	"is_correct" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"correct_count" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"score_percentage" integer NOT NULL,
	"passed" boolean NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assessment_choices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"choice_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"passing_score_percentage" integer DEFAULT 70 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_assessments_course_id_unique" UNIQUE("course_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_attempt_answers" ADD CONSTRAINT "assessment_attempt_answers_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_attempt_answers" ADD CONSTRAINT "assessment_attempt_answers_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_attempt_answers" ADD CONSTRAINT "assessment_attempt_answers_selected_choice_id_assessment_choices_id_fk" FOREIGN KEY ("selected_choice_id") REFERENCES "public"."assessment_choices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_course_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."course_assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_choices" ADD CONSTRAINT "assessment_choices_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_course_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."course_assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_assessments" ADD CONSTRAINT "course_assessments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessment_attempt_answers_attempt_id_index" ON "assessment_attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "assessment_attempt_answers_attempt_id_question_id_unique" ON "assessment_attempt_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessment_attempts_assessment_id_user_id_index" ON "assessment_attempts" USING btree ("assessment_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessment_choices_question_id_index" ON "assessment_choices" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assessment_questions_assessment_id_index" ON "assessment_questions" USING btree ("assessment_id");