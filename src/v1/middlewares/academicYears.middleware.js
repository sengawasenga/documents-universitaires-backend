const { body, validationResult } = require("express-validator");

exports.validateAcademicYearsData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour l'annee academique'."),
    body("universityId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour l'annee academique."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateUpdateAcademicYearsData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour l'annee academique."),
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
