CREATE TYPE "public"."watchlist_category" AS ENUM('swing', 'short_term', 'long_term');--> statement-breakpoint
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
