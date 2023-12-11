const { body, validationResult } = require("express-validator");

exports.validateDocumentsData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour le document."),
    body("documentType")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un type de document."),
    body("userId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir proprietaire de document."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.handleAllowedMethods = (req, res, next) => {
    const allowedMethods = ["GET", "POST", "PATCH"];

    if (!allowedMethods.includes(req.method)) {
        // Check if the requested HTTP method is allowed
        const error = new Error("Cette méthode n'est pas autorisée.");
        error.status = 405;
        next(error);
    } else {
        next();
    }
};
