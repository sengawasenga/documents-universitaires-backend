const express = require("express");
const usersMiddleware = require("../middlewares/users.middleware");
const usersController = require("../controllers/users.controller");


const router = express.Router();

// this route is about: GET api/v1/users/
router.get("/", usersMiddleware.handleAllowedMethods, usersController.getUsers);

// this route is about: GET api/v1/users/{uid}
router.get(
    "/:uid",
    usersMiddleware.handleAllowedMethods,
    usersController.getUser
);

// this route is about: PUT api/v1/users/{uid}
router.put(
    "/:uid",
    usersMiddleware.handleAllowedMethods,
    usersMiddleware.validateUsersData,
    usersController.updateUser
);
