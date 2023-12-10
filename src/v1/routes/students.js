const express = require("express");
const studentsMiddleware = require("../middlewares/students.middleware");
const studentsController = require("../controllers/students.controller");
const { isStudent } = require("../middlewares/auth/isStudent");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/students
router.post(
    "/",
    isStudent(),
    studentsMiddleware.handleAllowedMethods,
    studentsMiddleware.validateStudentsData,
    studentsController.createStudent
);

// this route is about: PUT api/v1/students/{id}
router.put(
    "/:id",
    isStudent(),
    studentsMiddleware.handleAllowedMethods,
    studentsMiddleware.validateUpdateStudentsData,
    studentsController.updateStudent
);

// this route is about: GET api/v1/students/
router.get(
    "/",
    isAuth(),
    studentsMiddleware.handleAllowedMethods,
    studentsController.getStudents
);

// this route is about: GET api/v1/students/{id}
router.get(
    "/:id",
    isAuth(),
    studentsMiddleware.handleAllowedMethods,
    studentsController.getStudent
);

// this route is about: PATCH api/v1/students/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isStudent(),
    studentsMiddleware.handleAllowedMethods,
    studentsController.deactivateStudent
);

// this route is about: PATCH api/v1/students/{id}/activate
router.patch(
    "/:id/activate",
    isStudent(),
    studentsMiddleware.handleAllowedMethods,
    studentsController.activateStudent
);

module.exports = router;
