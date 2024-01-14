import React from 'react';

import classes from "./page.module.css"
import Image from "next/image";
import {getMealBySlug} from "@/lib/meals";
import notFound from "@/app/not-found";

export async function generateMetadata({ params }) {
    const meal = getMealBySlug(params.mealSlug);

    if(!meal) {
        return notFound();
    }

    return {
        title: meal.title,
        description: meal.summary
    }
}

const MealDetailsPage =   ({params}) => {
  const meal = getMealBySlug(params.mealSlug);

  if(!meal) {
    notFound();
  }

  meal.instructions = meal?.instructions.replace(/\\n/g, '\n');

  return (
      <>
        <header className={classes.header}>
          <div className={classes.image}>
            <Image src={`https://sallah-nextjs-foodies-images.s3.eu-north-1.amazonaws.com/${meal.image}`} alt={meal.title} fill />
          </div>
          <div className={classes.headerText}>
            <h1>{meal.title}</h1>
            <p className={classes.creator}>
              by <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
            </p>
            <p className={classes.summary}>{meal.summary}</p>
          </div>
        </header>
          <main>
            <p className={classes.instructions}  dangerouslySetInnerHTML={{
                __html: meal.instructions
            }}>
            </p>
          </main>
      </>
  );
};

export default MealDetailsPage;
