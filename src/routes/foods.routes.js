const { Router } = require("express");

const FoodsController = require("../controllers/FoodsController");
const FoodPhotoController = require("../controllers/FoodPhotoController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const foodsRoutes = Router();
const upload = multer(uploadConfig.MULTER);
const foodsController = new FoodsController();
const foodPhotoController = new FoodPhotoController();

foodsRoutes.use(ensureAuthenticated);

foodsRoutes.get("/", foodsController.index);
foodsRoutes.post("/", verifyUserAuthorization("admin"), foodsController.create);
foodsRoutes.put("/:id", verifyUserAuthorization("admin"), foodsController.update);

foodsRoutes.get("/:id", foodsController.show);
foodsRoutes.delete("/:id", verifyUserAuthorization("admin"), foodsController.delete);

foodsRoutes.patch(
  "/photo-food/:id",
  ensureAuthenticated,
  verifyUserAuthorization("admin"),
  upload.single("photo-food"),
  foodPhotoController.update
);

module.exports = foodsRoutes;
