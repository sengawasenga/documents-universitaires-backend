const express = require("express");
const academicYearsMiddleware = require("../middlewares/academicYears.middleware");
const academicYearsController = require("../controllers/academicYears.controller");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/academicYears
router.post(
    "/",
    isOwner(),
    academicYearsMiddleware.handleAllowedMethods,
    academicYearsMiddleware.validateAcademicYearsData,
    academicYearsController.createAcademicYear
);

// this route is about: PUT api/v1/academicYears/{id}
router.put(
    "/:id",
    isOwner(),
    academicYearsMiddleware.handleAllowedMethods,
    academicYearsMiddleware.validateUpdateAcademicYearsData,
    academicYearsController.updateAcademicYear
);

// this route is about: GET api/v1/academicYears/
router.get(
    "/",
    isAuth(),
    academicYearsMiddleware.handleAllowedMethods,
    academicYearsController.getAcademicYears
);

// this route is about: GET api/v1/academicYears/{id}
router.get(
    "/:id",
    isAuth(),
    academicYearsMiddleware.handleAllowedMethods,
    academicYearsController.getAcademicYear
);

// this route is about: PATCH api/v1/academicYears/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    academicYearsMiddleware.handleAllowedMethods,
    academicYearsController.deactivateAcademicYear
);

// this route is about: PATCH api/v1/academicYears/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    academicYearsMiddleware.handleAllowedMethods,
    academicYearsController.activateAcademicYear
);

module.exports = router;
