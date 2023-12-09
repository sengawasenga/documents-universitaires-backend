const express = require("express");
const departmentsMiddleware = require("../middlewares/departments.middleware");
const departmentsController = require("../controllers/departments.controller");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

// this route is about: POST api/v1/departments
router.post(
    "/",
    isOwner(),
    departmentsMiddleware.handleAllowedMethods,
    departmentsMiddleware.validateDepartmentsData,
    departmentsController.createDepartment
);

// this route is about: PUT api/v1/departments/{id}
router.put(
    "/:id",
    isOwner(),
    departmentsMiddleware.handleAllowedMethods,
    departmentsMiddleware.validateUpdateDepartmentsData,
    departmentsController.updateDepartment
);

// this route is about: GET api/v1/departments/
router.get(
    "/",
    isAuth(),
    departmentsMiddleware.handleAllowedMethods,
    departmentsController.getDepartments
);

// this route is about: GET api/v1/departments/{id}
router.get(
    "/:id",
    isAuth(),
    departmentsMiddleware.handleAllowedMethods,
    departmentsController.getDepartment
);

// this route is about: PATCH api/v1/departments/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    departmentsMiddleware.handleAllowedMethods,
    departmentsController.deactivateDepartment
);

// this route is about: PATCH api/v1/departments/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    departmentsMiddleware.handleAllowedMethods,
    departmentsController.activateDepartment
);

module.exports = router;
