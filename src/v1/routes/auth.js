const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// this route is about: api/v1/auth/signup
router.post(
    "/signup",
    authMiddleware.handleAllowedMethods,
    authMiddleware.validateRegisterRequest,
    authController.signup
);

module.exports = router;
