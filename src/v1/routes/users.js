const express = require("express");
const usersMiddleware = require("../middlewares/users.middleware");
const postsController = require("../controllers/posts.controller");


const router = express.Router();

// this route is about: GET api/v1/users/
router.get("/", usersMiddleware.handleAllowedMethods, usersController.getUsers);
