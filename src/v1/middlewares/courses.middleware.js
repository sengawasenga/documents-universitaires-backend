const { body, validationResult } = require("express-validator");

exports.validateCoursesData = [
    body("name")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un nom pour ce cours'."),
    body("ponderation")
        .isInt()
        .notEmpty()
        .withMessage("Veuillez fournir une ponderation pour ce cours'."),
    body("classroomId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une classe pour ce cours."),
    body("professorId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un professeur pour ce cours."),
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
