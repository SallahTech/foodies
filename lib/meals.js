import fs from 'node:fs'
import { S3 } from '@aws-sdk/client-s3';

import sql from 'better-sqlite3'
import slugify from 'slugify'
import xss from 'xss'

const s3 = new S3({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const db = sql('meals.db')

export async function  getMeals() {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return db.prepare('SELECT * FROM meals').all()
}

export  function getMealBySlug(slug) {
    return db.prepare('SELECT * FROM meals WHERE slug=?').get(slug)
}

export async function saveMeal(meal) {
     meal.slug = slugify(meal.title, {lower: true})
    meal.instructions = xss(meal.instructions)


    const extension = meal.image.name.split('.').pop()
    const fileName = `${meal.slug}.${extension}`

    const bufferImage = await meal.image.arrayBuffer()

  s3.putObject({
    Bucket: 'sallah-nextjs-foodies-images',
    Key: fileName,
    Body: Buffer.from(bufferImage),
    ContentType: meal.image.type,
  });

  meal.image = fileName

  db.prepare(`
  INSERT INTO meals 
  (title, slug, image, summary, instructions, creator, creator_email)
  VALUES (
      @title,
      @slug,
      @image,
      @summary,
      @instructions,
      @creator,
      @creator_email
    )
  `).run(meal)

}
