const { Router } = require("express");

const FoodsController = require("../controllers/FoodsController");
const FoodPhotoController = require("../controllers/FoodPhotoController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const foodsRoutes = Router();
const upload = multer(uploadConfig.MULTER);
const foodsController = new FoodsController();
const foodPhotoController = new FoodPhotoController();

foodsRoutes.use(ensureAuthenticated);

foodsRoutes.get("/", foodsController.index);
foodsRoutes.post("/", foodsController.create);
foodsRoutes.put("/:id", foodsController.update);

foodsRoutes.get("/:id", foodsController.show);
foodsRoutes.delete("/:id", foodsController.delete);

foodsRoutes.patch("/photo-food/:id", ensureAuthenticated, upload.single("photo-food"), foodPhotoController.update);

module.exports = foodsRoutes;
