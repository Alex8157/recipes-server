CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" TEXT NOT NULL
);

CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "image" TEXT
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
  "user_id" INTEGER REFERENCES "users"("id"),
  "expiration_date" TIMESTAMP
);

INSERT INTO "category" ("name", "image") VALUES 
  ('Закуски', 'https://alimero.ru/uploads/images/18/24/42/2021/07/17/e97d87.jpg'),
  ('Салаты', 'https://menunedeli.ru/wp-content/uploads/2022/08/16B637CC-8E8B-4725-8953-2B33BC461A39-scaled.jpeg'),
  ('Первые блюда (супы)', 'https://avatars.dzeninfra.ru/get-zen_doc/9709210/pub_643a76d319c01e7b0b077a24_643a77309883b60ecf59764b/scale_1200'),
  ('Вторые блюда', 'https://recipes.av.ru//media/recipes/102062_picture_s34yNVr.jpg'),
  ('Десерты', 'https://xn--90asifwja4d.xn--p1ai/img/3857.jpg'),
  ('Напитки', 'https://hoff.ru/upload/iblock/d70/d705784733a2944160d2649bdc451410.jpg'),
  ('Завтраки', 'https://yagoda.coffee/shop/admin/uploads/4ad09f93eeed7d7c000c990e38a7bd4e2246ca8e001.jpg');
