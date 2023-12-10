const express = require("express");
const coursesMiddleware = require("../middlewares/courses.middleware");
const coursesController = require("../controllers/courses.controller");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/courses
router.post(
    "/",
    isOwner(),
    coursesMiddleware.handleAllowedMethods,
    coursesMiddleware.validateCoursesData,
    coursesController.createCourse
);

// this route is about: PUT api/v1/courses/{id}
router.put(
    "/:id",
    isOwner(),
    coursesMiddleware.handleAllowedMethods,
    coursesMiddleware.validateCoursesData,
    coursesController.updateCourse
);

// this route is about: GET api/v1/courses/
router.get(
    "/",
    isAuth(),
    coursesMiddleware.handleAllowedMethods,
    coursesController.getCourses
);

// this route is about: GET api/v1/courses/{id}
router.get(
    "/:id",
    isAuth(),
    coursesMiddleware.handleAllowedMethods,
    coursesController.getCourse
);

// this route is about: PATCH api/v1/courses/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    coursesMiddleware.handleAllowedMethods,
    coursesController.deactivateCourse
);

// this route is about: PATCH api/v1/courses/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    coursesMiddleware.handleAllowedMethods,
    coursesController.activateCourse
);

module.exports = router;
