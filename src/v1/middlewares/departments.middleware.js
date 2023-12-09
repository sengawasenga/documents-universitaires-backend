const { body, validationResult } = require("express-validator");

exports.validateDepartmentsData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour la departement."),
    body("facultyId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour la departement."),
    body("description")
        .isString()
        .withMessage(
            "Veuillez fournir une breve description de votre departement."
        ),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateUpdateDepartmentsData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour la departement."),
    body("description")
        .isString()
        .withMessage(
            "Veuillez fournir une breve description de votre departement."
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
