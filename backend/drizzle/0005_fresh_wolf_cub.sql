ALTER TABLE "research_reports" ADD COLUMN "stock_symbol" varchar(20);--> statement-breakpoint
ALTER TABLE "research_reports" ADD COLUMN "stock_name" varchar(255);--> statement-breakpoint
ALTER TABLE "research_reports" ADD COLUMN "analyst_rating" varchar(50);--> statement-breakpoint
ALTER TABLE "research_reports" ADD COLUMN "target_price" integer;