const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class FoodPhotoController {
  async update(req, res) {
    const food_id = req.params.id;
    const imageFilename = req.file.filename;

    const diskStorage = new DiskStorage();

    const food = await knex("foods").where({ id: food_id }).first();

    if (!food) {
      throw new AppError("Apenas usuarios autenticados podem atualizar a foto dos dos itens.", 401);
    }

    if (food.url_image) {
      await diskStorage.deleteFile(food.url_image);
    }

    const filename = await diskStorage.saveFile(imageFilename);
    food.url_image = filename ?? food.url_image;

    await knex("foods").where({ id: food_id }).update({
      url_image: food.url_image,
      updated_at: knex.fn.now(),
    });

    return res.json(food);
  }
}

module.exports = FoodPhotoController;
