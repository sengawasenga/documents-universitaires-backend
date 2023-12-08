const { body, validationResult } = require("express-validator");

exports.validateRegisterRequest = [
    body("username")
        .isString()
        .notEmpty()
        .withMessage("Ce champ est obligatoire."),
    body("accountType")
        .isString()
        .notEmpty()
        .withMessage("Ce champ est obligatoire."),
    body("email").isEmail().withMessage("Entrez un email valide."),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit au moins avoir 8 caractères."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

exports.handleAllowedMethods = (req, res, next) => {
    const allowedMethods = ["POST"];

    if (!allowedMethods.includes(req.method)) {
        // Check if the requested HTTP method is allowed
        const error = new Error("Cette méthode n'est pas autorisée.");
        error.status = 405;
        next(error);
    } else {
        next();
    }
};
