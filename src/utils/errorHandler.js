// Handle 401 errors (unauthorized request).
exports.handleNotFound = (req, res, next) => {
    res.status(401).json({ error: "Vous n'êtes pas autorisé à" });
};

// Handle 404 errors (resource not found)
exports.handleNotFound = (req, res, next) => {
    res.status(404).json({ error: "Aucune ressource trouvée." });
};

// Handle 405 errors (method not allowed)
exports.handleMethodNotAllowed = (err, req, res, next) => {
    if (err.status === 405) {
        res.status(405).json({ error: "Cette méthode n'est pas autorisée." });
    } else {
        next(err);
    }
};

// Handle server errors (500 errors)
exports.handleServerError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Erreur interne du serveur." });
};
