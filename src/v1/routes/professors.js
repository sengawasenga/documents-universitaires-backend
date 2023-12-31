const express = require("express");
const professorsMiddleware = require("../middlewares/professors.middleware");
const professorsController = require("../controllers/professors.controller");
const { isProfessor } = require("../middlewares/auth/isProfessor");
const { isAuth } = require("../middlewares/auth/isAuth");
const { isOwner } = require("../middlewares/auth/isOwner");

const router = express.Router();

// this route is about: POST api/v1/professors
router.post(
    "/",
    isProfessor(),
    professorsMiddleware.handleAllowedMethods,
    professorsMiddleware.validateProfessorsData,
    professorsController.createProfessor
);

// this route is about: PUT api/v1/professors/{id}
router.put(
    "/:id",
    isProfessor(),
    professorsMiddleware.handleAllowedMethods,
    professorsMiddleware.validateUpdateProfessorsData,
    professorsController.updateProfessor
);

// this route is about: GET api/v1/professors/
router.get(
    "/",
    isAuth(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.getProfessors
);

// this route is about: GET api/v1/professors/{id}
router.get(
    "/:id",
    isAuth(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.getProfessor
);

// this route is about: PATCH api/v1/professors/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isProfessor(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.deactivateProfessor
);

// this route is about: PATCH api/v1/professors/{id}/activate
router.patch(
    "/:id/activate",
    isProfessor(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.activateProfessor
);

// this route is about: PATCH api/v1/professors/{id}/approve
router.patch(
    "/:id/approve",
    isOwner(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.approveProfessor
);

// this route is about: PATCH api/v1/professors/{id}/decline
router.patch(
    "/:id/decline",
    isOwner(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.declineProfessor
);

// this route is about: GET api/v1/professors/{id}/courses
router.get(
    "/:id/courses",
    isAuth(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.getCourses
);

// this route is about: GET api/v1/professors/{id}/classrooms
router.get(
    "/:id/classrooms",
    isAuth(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.getClassrooms
);

// this route is about: GET api/v1/professors/{id}/students
router.get(
    "/:id/students",
    isAuth(),
    professorsMiddleware.handleAllowedMethods,
    professorsController.getStudents
);

module.exports = router;
