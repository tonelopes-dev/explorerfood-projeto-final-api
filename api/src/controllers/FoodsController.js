const knex = require("../database/knex");
const AppError = require("../utils/AppError");

async function searchFoods(foodName, ingredients, categoryFood) {
  const filterIngredients = ingredients ? ingredients.split(",").map((ingredient) => ingredient.trim()) : null;

  let query = knex("foods")
    .select(
      "foods.id",
      "foods.title",
      "foods.category",
      "foods.url_image",
      "foods.price",
      "foods.description",
      "foods.created_at",
      "foods.updated_at"
    )
    .leftJoin("food_ingredients", "foods.id", "=", "food_ingredients.food_id");

  if (foodName) {
    query = query.where("foods.title", "like", `%${foodName}%`);
  }

  if (filterIngredients && filterIngredients.length > 0) {
    query = query.orWhere((builder) => {
      builder.whereIn("food_ingredients.name", filterIngredients);
    });
  }

  if (categoryFood) {
    query = query.where("foods.category", categoryFood);
  }

  const foods = await query.distinct("foods.id").orderBy("foods.title");

  // Agora, para cada comida, buscar os ingredientes
  for (let food of foods) {
    const ingredients = await knex("food_ingredients").where("food_id", food.id).select("name");
    food.ingredients = ingredients.map((ing) => ing.name);
  }

  return foods;
}

class FoodsController {
  async create(request, response) {
    const { title, description, category, ingredients, price } = request.body;
    const user_id = request.user.id;

    const [food_id] = await knex("foods").insert({
      title,
      description,
      user_id,
      category,
      price,
    });
    const ingredientsInsert = ingredients.map((ingredient) => {
      return {
        name: ingredient,
        food_id,
        user_id,
      };
    });
    await knex("food_ingredients").insert(ingredientsInsert);

    return response.json({ food_id });
  }
  async show(request, response) {
    const food_id = request.params.id;

    const food = await knex("foods").where({ id: food_id }).first();
    const ingredients = await knex("food_ingredients").where({ food_id }).orderBy("name");

    return response.json({ ...food, ingredients });
  }
  async delete(request, response) {
    const { id } = request.params;

    await knex("foods").where({ id }).delete();
    return response.json();
  }
  async index(request, response) {
    const { foodName, ingredients, categoryFood } = request.query;

    try {
      const foodsWithIngredients = await searchFoods(foodName, ingredients, categoryFood);
      return response.json(foodsWithIngredients);
    } catch (error) {
      console.error("Erro ao buscar alimentos: ", error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async update(request, response) {
    const { title, description, category, ingredients, price } = request.body;
    const food_id = request.params.id;

    const food = await knex("foods").where({ id: food_id }).first();

    if (!food) {
      throw new AppError("Item do cardapio não encontrado.");
    }
    let ingredientsInsert = "";

    if (ingredients.length > 0) {
      await knex("food_ingredients").where({ food_id }).delete();
      ingredientsInsert = ingredients.map((ingredient) => {
        return {
          name: ingredient,
          food_id,
        };
      });
      await knex("food_ingredients").insert(ingredientsInsert);
    }
    food.title = title ?? food.title;
    food.description = description ?? food.description;
    food.category = category ?? food.category;
    food.price = price ?? food.price;

    const foodUpdated = await knex("foods").where({ id: food.id }).update({
      title: food.title,
      category: food.category,
      description: food.description,
      ingredients: food.ingredients,
      price: food.price,
      updated_at: knex.fn.now(),
    });
    if (!foodUpdated) {
      throw new AppError("Não foi possível atualizar o item");
    }

    await knex("categories").where({ id: food.id }).update;

    return response.status(200).json({ message: "Item do cardapio atualizado com sucesso!" });
  }
}

module.exports = FoodsController;
