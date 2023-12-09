const { body, validationResult } = require("express-validator");

exports.validateFacultiesData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour la faculte."),
    body("universityId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour la faculte."),
    body("description")
        .isString()
        .withMessage(
            "Veuillez fournir une breve description de votre faculte."
        ),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateUpdateFacultiesData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour la faculte."),
    body("description")
        .isString()
        .withMessage(
            "Veuillez fournir une breve description de votre faculte."
        ),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.handleAllowedMethods = (req, res, next) => {
    const allowedMethods = ["GET", "POST", "PUT", "PATCH"];

    if (!allowedMethods.includes(req.method)) {
        // Check if the requested HTTP method is allowed
        const error = new Error("Cette méthode n'est pas autorisée.");
        error.status = 405;
        next(error);
    } else {
        next();
    }
};
