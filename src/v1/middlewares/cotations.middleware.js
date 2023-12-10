const { body, validationResult } = require("express-validator");

exports.validateCotationsData = [
    body("total")
        .isInt()
        .notEmpty()
        .withMessage("Veuillez fournir le point total"),
    body("rating")
        .isFloat()
        .notEmpty()
        .withMessage("Veuillez fournir le point obtenu"),
    body("courseId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir le cours"),
    body("studentId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir l'etudiant"),
    body("academicYearId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir l'etudiant"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateUpdateCotationsData = [
    body("total")
        .isInt()
        .notEmpty()
        .withMessage("Veuillez fournir le point total"),
    body("rating")
        .isFloat()
        .notEmpty()
        .withMessage("Veuillez fournir le point obtenu"),
    body("courseId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir le cours"),
    body("studentId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir l'etudiant"),
    body("academicYearId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir l'etudiant"),
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
