import type { FoodCategory } from "./types";

/** One-line wow facts for curious tappers in the Snack Lab. */
const FACTS: Record<string, string> = {
  pizza: "The most popular pizza topping in the world is pepperoni!",
  nuggets: "Chicken nuggets were invented in the 1960s by a professor!",
  sandwich: "The sandwich is named after the Earl of Sandwich!",
  pasta: "There are more than 600 shapes of pasta in the world!",
  fries: "French fries probably come from Belgium, not France!",
  rice: "Half the people on Earth eat rice almost every day!",
  corn: "Corn always has an even number of rows on each ear!",
  mash: "Potatoes were first grown in the mountains of Peru!",
  apple: "Apples float because they are one quarter air!",
  banana: "Bananas are berries, but strawberries are not!",
  grapes: "Grapes explode into jam when you freeze and warm them. Pop!",
  orange: "One orange has more than 100 tiny juice sacs inside!",
  carrots: "Carrots help your eyes see better in the dark!",
  broccoli: "Broccoli is full of tiny flower buds you can eat!",
  cucumber: "Cucumbers are 96 percent water. Crunchy water!",
  salad: "People have eaten salads for more than 2000 years!",
  milk: "Milk has the same stuff your bones need to grow strong!",
  water: "Your body is more than half water. Drink up!",
  juice: "It takes about 3 oranges to fill one glass of juice!",
  "choc-milk": "Chocolate milk helps tired muscles feel better!",
  cookie: "The chocolate chip cookie was invented by accident!",
  yogurt: "Yogurt is milk that friendly germs turned thick and tangy!",
  granola: "Granola was invented as a healthy breakfast over 150 years ago!",
  pudding: "Pudding wobbles because it is mostly milk held together loosely!",
};

const CATEGORY_FALLBACK: Record<FoodCategory, string> = {
  main: "Grown-ups cook main dishes to give you energy to play!",
  side: "Side dishes add colors and flavors to your tray!",
  fruit: "Fruits grow from flowers. Sweet magic!",
  veggie: "Veggies help you run fast and stay healthy!",
  drink: "Drinks keep every part of you working!",
  snack: "Snacks are little energy boosts between meals!",
};

/** Fun fact for any food item, by id first, then category. */
export function foodFact(id: string, fallback: FoodCategory): string {
  return FACTS[id] ?? CATEGORY_FALLBACK[fallback];
}
