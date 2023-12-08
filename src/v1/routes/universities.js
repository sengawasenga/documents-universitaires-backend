const express = require("express");
const universitiesMiddleware = require("../middlewares/universities.middleware");
const universitiesController = require("../controllers/universities.controller");

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
    upload.array("images"),
    universitiesMiddleware.handleAllowedMethods,
    universitiesMiddleware.validateUniversitiesData,
    universitiesController.createUniversity
);

// this route is about: PUT api/v1/universities/{id}
router.put(
    "/:id",
    upload.array("images"),
    universitiesMiddleware.handleAllowedMethods,
    universitiesMiddleware.validateUniversitiesData,
    universitiesController.updateUniversity
);

// this route is about: GET api/v1/universities/
router.get(
    "/",
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.getUniversities
);

// this route is about: GET api/v1/universities/{id}
router.get(
    "/:id",
    universitiesMiddleware.handleAllowedMethods,
    universitiesController.getUniversity
);

module.exports = router;