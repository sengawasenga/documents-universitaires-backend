const { body, validationResult } = require("express-validator");

exports.validateProfessorsData = [
    body("userId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir l'id de l'utilisateur."),
    body("universityId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour le professeur."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateUpdateProfessorsData = [
    body("universityId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour le professeur."),
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
