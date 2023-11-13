CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" TEXT NOT NULL
);

CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

CREATE TABLE "recipes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "image" TEXT,
  "category" INTEGER REFERENCES "category"("id"),
  "ingredients" TEXT[],
  "cookingSteps" TEXT[]
);

CREATE TABLE "sessions" (
  "id" UUID PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id")
);

INSERT INTO "category" ("name") VALUES 
  ('Snack'),
  ('Salad'),
  ('First course'),
  ('Second course'),
  ('Dessert'),
  ('Drinks'),
  ('Breakfast');
