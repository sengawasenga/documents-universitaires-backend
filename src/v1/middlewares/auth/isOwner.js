const admin = require("../../../firebase/db");

const verifyIdToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Error verifying the token", error);
        throw new Error("Le token a expiré ou n'est pas valide");
    }
};

const isOwner = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];

            if (!token) {
                console.error("No token provided");
                return res.status(401).send({
                    message:
                        "Veuillez fournir une clé d'API pour utiliser cet endpoint.",
                });
            }

            const decodedToken = await verifyIdToken(token);

            if (!decodedToken) {
                console.error(`Invalid ID token provided`);
                res.status(403).send({
                    message: `La clé d'API que vous avez fourni n'est pas valide ou a expiré.`,
                });
                return;
            }

            const usersRef = admin.firestore().collection("users");
            const userDoc = await usersRef.doc(decodedToken.user_id).get();

            if (!userDoc.exists) {
                console.error("User not found");
                return res.status(404).send({
                    message: "Utilisateur non trouvé.",
                });
            }

            const userData = userDoc.data();

            if (userData.accountType != "owner") {
                res.status(403).send({
                    message: `Vous n'avez pas de rôle requis pour effectuer cette action.`,
                });
                return;
            }

            userData.uid = decodedToken.user_id;
            req.user = userData;
            next();
        } catch (error) {
            console.error("Authentication error", error);
            if (error.code == "auth/id-token-expired") {
                return res.status(401).send({
                    message: "Votre token a expiré",
                });
            } else {
                return res.status(401).send({
                    message:
                        "Une erreur est survenue lors de la verification du token.",
                    error: error.message,
                });
            }
        }
    };
};

module.exports = { isOwner };
