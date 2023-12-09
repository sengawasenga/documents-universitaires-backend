const express = require("express");
const classroomsMiddleware = require("../middlewares/classrooms.middleware");
const classroomsController = require("../controllers/classrooms.controller");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/classrooms
router.post(
    "/",
    isOwner(),
    classroomsMiddleware.handleAllowedMethods,
    classroomsMiddleware.validateClassroomsData,
    classroomsController.createClassroom
);

// this route is about: PUT api/v1/classrooms/{id}
router.put(
    "/:id",
    isOwner(),
    classroomsMiddleware.handleAllowedMethods,
    classroomsMiddleware.validateUpdateClassroomsData,
    classroomsController.updateClassroom
);

// this route is about: GET api/v1/classrooms/
router.get(
    "/",
    isAuth(),
    classroomsMiddleware.handleAllowedMethods,
    classroomsController.getClassrooms
);

// this route is about: GET api/v1/classrooms/{id}
router.get(
    "/:id",
    isAuth(),
    classroomsMiddleware.handleAllowedMethods,
    classroomsController.getClassroom
);

// this route is about: PATCH api/v1/classrooms/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    classroomsMiddleware.handleAllowedMethods,
    classroomsController.deactivateClassroom
);

// this route is about: PATCH api/v1/classrooms/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    classroomsMiddleware.handleAllowedMethods,
    classroomsController.activateClassroom
);

module.exports = router;
