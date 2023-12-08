const express = require("express");
const usersMiddleware = require("../middlewares/users.middleware");
const usersController = require("../controllers/users.controller");


const router = express.Router();

// this route is about: GET api/v1/users/
router.get("/", usersMiddleware.handleAllowedMethods, usersController.getUsers);

// this route is about: GET api/v1/users/{uid}
router.get(
    "/:uid",
    isAuth(),
    usersMiddleware.handleAllowedMethods,
    usersController.getUser
);
