const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const UsersController = require("../controllers/UsersController");
const UserAvatarController = require("../controllers/UserAvatarController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const UsersValidatedController = require("../controllers/UsersValidatedController");

const usersRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const usersController = new UsersController();
const userAvatarController = new UserAvatarController();

const usersValidatedController = new UsersValidatedController();

usersRoutes.post("/", usersController.create);
usersRoutes.get("/validated", ensureAuthenticated, usersValidatedController.index);
usersRoutes.put("/", ensureAuthenticated, usersController.update);
usersRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarController.update);
8;
module.exports = usersRoutes;
