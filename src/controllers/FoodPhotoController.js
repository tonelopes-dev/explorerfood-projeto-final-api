const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class FoodPhotoController {
  async update(req, res) {
    const food_id = req.params.id;
    const avatarFilename = req.file.filename;

    const diskStorage = new DiskStorage();

    const food = await knex("foods").where({ id: food_id }).first();

    if (!food) {
      throw new AppError("Apenas usuarios autenticados podem atualizar a foto dos dos itens.", 401);
    }

    if (food.avatar) {
      await diskStorage.deleteFile(food.avatar);
    }

    const filename = await diskStorage.saveFile(avatarFilename);
    food.avatar = filename;

    await knex("foods").where({ id: food_id }).update({
      avatar: food.avatar,
      updated_at: knex.fn.now(),
    });

    return res.json(food);
  }
}

module.exports = FoodPhotoController;
