const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FoodsController {
  async create(request, response) {
    const { title, description, category, ingredients } = request.body;
    const user_id = request.user.id;

    const [food_id] = await knex("foods").insert({
      title,
      description,
      user_id,
      category,
    });
    const ingredientsInsert = ingredients.map((ingredient) => {
      return {
        name: ingredient,
        food_id,
      };
    });
    await knex("food_ingredients").insert(ingredientsInsert);

    return response.json();
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
    const { foodName, ingredients } = request.query;

    let foods;

    if (ingredients) {
      const filterIngredients = ingredients.split(",").map((ingredient) => ingredient.trim());

      foods = await knex("food_ingredients")
        .select(["foods.id", "foods.title"])
        .modify(function (queryBuilder) {
          if (foodName) {
            queryBuilder.whereLike("foods.title", `%${foodName}%`);
          }
        })
        .whereIn("name", filterIngredients)
        .innerJoin("foods", "foods.id", "food_ingredients.food_id")
        .groupBy(["foods.id", "foods.title"])
        .orderBy("foods.title");
    } else {
      foods = await knex("foods")
        .modify(function (queryBuilder) {
          if (foodName) {
            queryBuilder.whereLike("title", `%${foodName}%`);
          }
        })
        .orderBy("title");
    }

    const allIngredients = await knex("food_ingredients");
    const foodsWithIngredients = foods.map((food) => {
      const foodIngredients = allIngredients.filter((ingredient) => ingredient.food_id === food.id);

      return {
        ...food,
        ingredients: foodIngredients,
      };
    });

    return response.json(foodsWithIngredients);
  }

  async update(request, response) {
    const { title, description, category, ingredients } = request.body;
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

    const foodUpdated = await knex("foods").where({ id: food.id }).update({
      title: food.title,
      category: food.category,
      description: food.description,
      ingredients: food.ingredients,
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
