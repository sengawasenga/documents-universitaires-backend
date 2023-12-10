const express = require("express");
const cotationsMiddleware = require("../middlewares/cotations.middleware");
const cotationsController = require("../controllers/cotations.controller");
const { isProfessor } = require("../middlewares/auth/isProfessor");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/cotations
router.post(
    "/",
    isProfessor(),
    cotationsMiddleware.handleAllowedMethods,
    cotationsMiddleware.validateCotationsData,
    cotationsController.createCotation
);

// this route is about: PUT api/v1/cotations/{id}
router.put(
    "/:id",
    isProfessor(),
    cotationsMiddleware.handleAllowedMethods,
    cotationsMiddleware.validateUpdateCotationsData,
    cotationsController.updateCotation
);

// this route is about: GET api/v1/cotations/
router.get(
    "/",
    isAuth(),
    cotationsMiddleware.handleAllowedMethods,
    cotationsController.getCotations
);

// this route is about: GET api/v1/cotations/{id}
router.get(
    "/:id",
    isAuth(),
    cotationsMiddleware.handleAllowedMethods,
    cotationsController.getCotation
);

module.exports = router;
