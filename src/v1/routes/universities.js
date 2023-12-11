const express = require("express");
const universitiesMiddleware = require("../middlewares/universities.middleware");
const universitiesController = require("../controllers/universities.controller");
const multer = require("multer");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024, // 5 MB limit
        files: 1, // 1 file limit
    },
});

// this route is about: POST api/v1/universities
router.post(
    "/",
    isOwner(),
    upload.array("logo"),
    universitiesMiddleware.handleAllowedMethods,
    universitiesMiddleware.validateUniversitiesData,
    universitiesController.createUniversity
);

// this route is about: PUT api/v1/universities/{id}
router.put(
    "/:id",
    isOwner(),
    upload.array("logo"),
    universitiesMiddleware.handleAllowedMethods,
    universitiesMiddleware.validateUniversitiesData,
    universitiesController.updateUniversity
);

// this route is about: GET api/v1/universities/
router.get(
    "/",
    isAuth(),
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.getUniversities
);

// this route is about: GET api/v1/universities/{id}
router.get(
    "/:id",
    isAuth(),
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.getUniversity
);

// this route is about: PATCH api/v1/universities/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.deactivateUniversity
);

// this route is about: PATCH api/v1/universities/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.activateUniversity
);

// this route is about: GET api/v1/universities/{id}/faculties
router.get(
    "/:id/faculties",
    isAuth(),
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.getFaculties
);

// this route is about: GET api/v1/universities/{id}/departments
router.get(
    "/:id/departments",
    isAuth(),
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.getDepartments
);

module.exports = router;
