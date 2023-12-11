const { body, validationResult } = require("express-validator");

exports.validateStudentsData = [
    body("userId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir l'id de l'utilisateur."),
    body("universityId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour l'etudiant."),
    body("facultyId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour l'etudiant."),
    body("departmentId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour l'etudiant."),
    body("classroomId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour l'etudiant."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.validateUpdateStudentsData = [
    body("universityId")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir une universite pour l'etudiant."),
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
