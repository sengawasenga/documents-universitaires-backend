const { body, validationResult } = require("express-validator");

exports.validateUsersData = [
    body("name").isString().notEmpty().withMessage("Veuillez fournir un nom."),
    body("firstName")
        .isString()
        .notEmpty()
        .withMessage("Veuillez fournir un prenom."),
    body("sexe")
        .isString()
        .isIn(["male", "female", "other"])
        .withMessage("Le sexe doit être 'male', 'femelle' ou 'autre'."),
    body("age")
        .isInt({ min: 0, max: 150 })
        .withMessage("Fournissez un âge correct."),
    body("telephone")
        .isString()
        .matches(/^\d{10}$/)
        .withMessage("Le numéro de téléphone doit avoir 10 chiffres."),
    body("address").isString().withMessage("Veuillez fournir une adresse de residence."),
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
