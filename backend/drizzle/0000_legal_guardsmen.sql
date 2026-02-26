CREATE TYPE "public"."content_status" AS ENUM('published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."cohort_status" AS ENUM('upcoming', 'open', 'closed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'refund');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('subscription', 'workshop');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."watchlist_category" AS ENUM('swing', 'short_term', 'long_term');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"is_verified" boolean DEFAULT false NOT NULL,
	"tier" varchar(20) DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"type" varchar(50) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "course_sessions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"course_id" varchar(26) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"session_order" integer NOT NULL,
	"duration_minutes" integer,
	"video_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"thumbnail_url" varchar(500),
	"content" text NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "research_reports" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"stock_symbol" varchar(20),
	"stock_name" varchar(255),
	"analyst_rating" varchar(50),
	"target_price" integer,
	"file_url" varchar(512),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "research_reports_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(500),
	"original_filename" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"filepath" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"uploaded_by" varchar(26) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "templates_filename_unique" UNIQUE("filename")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"filepath" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"alt" text,
	"description" text,
	"uploaded_by" varchar(26) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "images_filename_unique" UNIQUE("filename")
);
--> statement-breakpoint
CREATE TABLE "cohort_sessions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"cohort_id" varchar(26) NOT NULL,
	"course_session_id" varchar(26),
	"title" varchar(255) NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"zoom_link" varchar(500),
	"recording_url" varchar(500),
	"session_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"course_id" varchar(26) NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"enrollment_open_date" timestamp NOT NULL,
	"enrollment_close_date" timestamp NOT NULL,
	"status" "cohort_status" DEFAULT 'upcoming' NOT NULL,
	"max_participants" integer,
	"price" integer,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"midtrans_order_id" varchar(100) NOT NULL,
	"midtrans_transaction_id" varchar(100),
	"type" "payment_type" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"workshop_id" varchar(26),
	"promo_code_id" varchar(26),
	"referral_id" varchar(26),
	"payment_method" varchar(50),
	"raw_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	CONSTRAINT "payments_midtrans_order_id_unique" UNIQUE("midtrans_order_id"),
	CONSTRAINT "payments_midtrans_transaction_id_unique" UNIQUE("midtrans_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"payment_id" varchar(26),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(255),
	"discount_percent" integer NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_usages" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"referral_id" varchar(26) NOT NULL,
	"new_user_id" varchar(26) NOT NULL,
	"payment_id" varchar(26),
	"reward_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"code" varchar(20) NOT NULL,
	"total_uses" integer DEFAULT 0 NOT NULL,
	"rewards_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "referrals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"r2_key" varchar(500) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"duration_seconds" integer,
	"session_id" varchar(26),
	"uploaded_by" varchar(26) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_r2_key_unique" UNIQUE("r2_key")
);
--> statement-breakpoint
CREATE TABLE "watchlist_stocks" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"stock_symbol" varchar(20) NOT NULL,
	"stock_name" varchar(255) NOT NULL,
	"logo_url" varchar(512),
	"category" "watchlist_category" NOT NULL,
	"entry_price" integer,
	"target_price" integer,
	"stop_loss" integer,
	"current_price" integer,
	"analyst_rating" varchar(50),
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_holdings" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"stock_symbol" varchar(20) NOT NULL,
	"stock_name" varchar(255) NOT NULL,
	"logo_url" varchar(512),
	"avg_buy_price" numeric(12, 2) NOT NULL,
	"current_price" numeric(12, 2) NOT NULL,
	"total_shares" integer NOT NULL,
	"allocation_percent" numeric(5, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_sessions" ADD CONSTRAINT "cohort_sessions_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_sessions" ADD CONSTRAINT "cohort_sessions_course_session_id_course_sessions_id_fk" FOREIGN KEY ("course_session_id") REFERENCES "public"."course_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usages" ADD CONSTRAINT "referral_usages_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_usages" ADD CONSTRAINT "referral_usages_new_user_id_users_id_fk" FOREIGN KEY ("new_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_session_id_course_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."course_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;