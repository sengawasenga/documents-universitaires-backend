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

router.post(
    "/",
    upload.array("images"),
    universitiesMiddleware.handleAllowedMethods,
    universitiesMiddleware.validateUniversitiesData,
    universitiesController.createUniversity
);

module.exports = router;