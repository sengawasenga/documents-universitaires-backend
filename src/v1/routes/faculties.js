const express = require("express");
const facultiesMiddleware = require("../middlewares/faculties.middleware");
const facultiesController = require("../controllers/faculties.controller");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/faculties
router.post(
    "/",
    isOwner(),
    facultiesMiddleware.handleAllowedMethods,
    facultiesMiddleware.validateFacultiesData,
    facultiesController.createFaculty
);

// this route is about: PUT api/v1/faculties/{id}
router.put(
    "/:id",
    isOwner(),
    facultiesMiddleware.handleAllowedMethods,
    facultiesMiddleware.validateUpdateFacultiesData,
    facultiesController.updateFaculty
);

// this route is about: GET api/v1/faculties/
router.get(
    "/",
    isAuth(),
    facultiesMiddleware.handleAllowedMethods,
    facultiesController.getFaculties
);

// this route is about: GET api/v1/faculties/{id}
router.get(
    "/:id",
    isAuth(),
    facultiesMiddleware.handleAllowedMethods,
    facultiesController.getFaculty
);

// this route is about: PATCH api/v1/faculties/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    facultiesMiddleware.handleAllowedMethods,
    facultiesController.deactivateFaculty
);

// this route is about: PATCH api/v1/faculties/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    facultiesMiddleware.handleAllowedMethods,
    facultiesController.activateFaculty
);

module.exports = router;
