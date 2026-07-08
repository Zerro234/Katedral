CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" text PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50),
	"title" text NOT NULL,
	"slug" text,
	"body" text,
	"imageUrl" text,
	"location" text,
	"eventDate" text,
	"eventEndDate" text,
	"isPublished" boolean DEFAULT false,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "contents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "couple_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"registrationNumber" varchar(50),
	"groomName" text,
	"groomBirthdate" text,
	"groomPhone" varchar(20),
	"groomBaptismChurch" text,
	"brideName" text,
	"brideBirthdate" text,
	"bridePhone" varchar(20),
	"brideBaptismChurch" text,
	"groomPhoto" text,
	"bridePhoto" text,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "couple_profiles_registrationNumber_unique" UNIQUE("registrationNumber")
);
--> statement-breakpoint
CREATE TABLE "marriage_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"coupleProfileId" text NOT NULL,
	"priestId" text,
	"currentStage" integer DEFAULT 1 NOT NULL,
	"weddingDate" text,
	"is_reregistration" boolean DEFAULT false,
	"previous_application_id" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "required_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"applicationId" text NOT NULL,
	"documentName" text NOT NULL,
	"isReceived" boolean DEFAULT false,
	"receivedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "stage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"applicationId" text NOT NULL,
	"stageNumber" integer NOT NULL,
	"note" text,
	"changedBy" text NOT NULL,
	"changedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false,
	"image" text,
	"role" varchar(20) DEFAULT 'COUPLE' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couple_profiles" ADD CONSTRAINT "couple_profiles_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marriage_applications" ADD CONSTRAINT "marriage_applications_coupleProfileId_couple_profiles_id_fk" FOREIGN KEY ("coupleProfileId") REFERENCES "public"."couple_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marriage_applications" ADD CONSTRAINT "marriage_applications_priestId_user_id_fk" FOREIGN KEY ("priestId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "required_documents" ADD CONSTRAINT "required_documents_applicationId_marriage_applications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."marriage_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_applicationId_marriage_applications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."marriage_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_changedBy_user_id_fk" FOREIGN KEY ("changedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;