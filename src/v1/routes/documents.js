const express = require("express");
const documentsMiddleware = require("../middlewares/documents.middleware");
const documentsController = require("../controllers/documents.controller");
const multer = require("multer");
const { isOwner } = require("../middlewares/auth/isOwner");
const { isAuth } = require("../middlewares/auth/isAuth");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024, // 3 MB limit
        files: 1, // 1 file limit
    },
});

// this route is about: POST api/v1/documents
router.post(
    "/",
    isOwner(),
    upload.array("image"),
    documentsMiddleware.handleAllowedMethods,
    documentsMiddleware.validateDocumentsData,
    documentsController.createDocument
);

// this route is about: GET api/v1/documents/
router.get(
    "/",
    isAuth(),
    documentsMiddleware.handleAllowedMethods,
    documentsController.getDocuments
);

// this route is about: GET api/v1/documents/{id}
router.get(
    "/:id",
    isAuth(),
    documentsMiddleware.handleAllowedMethods,
    documentsController.getDocument
);

// this route is about: PATCH api/v1/documents/{id}/deactivate
router.patch(
    "/:id/deactivate",
    isOwner(),
    documentsMiddleware.handleAllowedMethods,
    documentsController.deactivateDocument
);

// this route is about: PATCH api/v1/documents/{id}/activate
router.patch(
    "/:id/activate",
    isOwner(),
    documentsMiddleware.handleAllowedMethods,
    documentsController.activateDocument
);

module.exports = router;
