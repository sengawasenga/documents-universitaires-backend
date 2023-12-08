const admin = require("../../../firebase/db");

exports.signup = async (req, res, next) => {
    // Handle register logic here

    const { email, password, username, accountType } = req.body;
    const currentDateTime = new Date();

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Save user information to Cloud Firestore
        const userRef = admin
            .firestore()
            .collection("users")
            .doc(userRecord.uid);
        await userRef.set({
            username,
            accountType,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        });

        res.json({
            message: "Vous avez créé votre compte avec succès!",
            uid: userRecord.uid,
        });
    } catch (error) {
        res.status(400).json({
            message: "Une erreur est survenue lors de la création du compte",
            error: error.message,
        });
    }
};
