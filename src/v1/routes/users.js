const express = require("express");
const usersMiddleware = require("../middlewares/users.middleware");
const usersController = require("../controllers/users.controller");
const { isAdmin } = require("../middlewares/auth/isAdmin");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: GET api/v1/users/
router.get(
    "/",
    isAdmin(),
    usersMiddleware.handleAllowedMethods,
    usersController.getUsers
);

// this route is about: GET api/v1/users/{uid}
router.get(
    "/:uid",
    isAuth(),
    usersMiddleware.handleAllowedMethods,
    usersController.getUser
);

// this route is about: PUT api/v1/users/{uid}
router.put(
    "/:uid",
    isAuth(),
    usersMiddleware.handleAllowedMethods,
    usersMiddleware.validateUsersData,
    usersController.updateUser
);

// this route is about: PATCH api/v1/users/{uid}/deactivate
router.patch(
    "/:uid/deactivate",
    isAuth(),
    usersMiddleware.handleAllowedMethods,
    usersController.deactivateUser
);

// this route is about: PATCH api/v1/users/{uid}/activate
router.patch(
    "/:uid/activate",
    isAuth(),
    usersMiddleware.handleAllowedMethods,
    usersController.activateUser
);

// this route is about: GET api/v1/users/{uid}/documents
router.get(
    "/:uid/documents",
    isAuth(),
    usersMiddleware.handleAllowedMethods,
    usersController.getDocuments
);

module.exports = router;
