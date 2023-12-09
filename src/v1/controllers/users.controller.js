const admin = require("../../firebase/db");
const paginate = require("../../utils/paginate");

// getting a list of users
exports.getUsers = async (req, res, next) => {
    try {
        // Retrieve the list of registered users from Cloud Firestore
        const usersRef = admin.firestore().collection("users");
        const usersSnapshot = await usersRef.get();
        const users = [];

        // Loop through each document and add it to the categories array
        usersSnapshot.forEach((doc) => {
            users.push({
                uid: doc.id,
                name: doc.data().name,
                firstName: doc.data().firstName,
                usename: doc.data().usename,
                sexe: doc.data().sexe,
                age: doc.data().age,
                telephone: doc.data().telephone,
                address: doc.data().address,
                accountType: doc.data().accountType,
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        });

        // Paginate the list of users
        const paginatedUsers = paginate(users, req.query.page, req.query.limit);

        // Send the paginated list of users as a JSON response
        res.json(paginatedUsers);
    } catch (error) {
        console.error("Error retrieving user list:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste d'utilisateurs",
            error: error.message,
        });
    }
};

// getting a specific user informations
exports.getUser = async (req, res, next) => {
    try {
        // Retrieve the user record from Firebase Authentication
        const userRecord = await admin.auth().getUser(req.params.uid);

        // Retrieve the user data from Cloud Firestore
        const usersRef = admin.firestore().collection("users");
        const userDoc = await usersRef.doc(req.params.uid).get();
        const userData = userDoc.data();

        if (!userDoc.exists) {
            return res.status(404).send({
                message: "Cet utilisateur n'a pas été trouvé",
            });
        }

        // Combine the user record and user data into a single object
        const user = {
            uid: userRecord.uid,
            name: userData.name,
            firstName: userData.firstName,
            username: userData.username,
            telephone: userData.telephone,
            address: userData.address,
            sexe: userData.sexe,
            accountType: userData.accountType,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        };

        // Send the user object as a JSON response
        res.json(user);
    } catch (error) {
        console.error("Error retrieving user infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de cet utilisateur`,
            error: error.message,
        });
    }
};

// updating a specific user information
exports.updateUser = async (req, res, next) => {
    const currentDateTime = new Date();

    const userData = {
        name: req.body.name,
        firstName: req.body.firstName,
        sexe: req.body.sexe,
        age: req.body.age,
        telephone: req.body.telephone,
        address: req.body.address,
        updatedAt: currentDateTime
    };

    try {
        // Retrieve the user data from Cloud Firestore
        const usersRef = admin.firestore().collection("users");
        const userDoc = await usersRef.doc(req.params.uid).get();

        // Check if the user exists
        if (!userDoc.exists) {
            res.status(404).send(
                `Aucun utilisateur trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        if (req.user.uid !== userDoc.id) {
            res.status(403).send({
                message: `Action non autorisée pour cet utilisateur`,
            });
            return;
        }

        // Update the user data with the validated request body
        await usersRef.doc(req.params.uid).update(userData);

        // Send the updated user data as a JSON response
        res.json({
            message: "Utilisateur mis à jour avec succès",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error(`Error updating user ${req.params.uid}:`, error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la mise à jour de cet utilisateur`,
            error: error.error.message,
        });
    }
};

// deactivate a specific user
exports.deactivateUser = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const uid = req.params.uid;
        const usersRef = admin.firestore().collection("users");
        const userDoc = await usersRef.doc(uid).get();

        // Check if the user exists
        if (!userDoc.exists) {
            res.status(404).send(
                `Aucun utilisateur trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        if (req.user.uid !== userDoc.id) {
            res.status(403).send({
                message: `Action non autorisée pour cet utilisateur`,
            });
            return;
        }

        // Deactivate user account
        await admin.auth().updateUser(uid, {
            disabled: true,
            updatedAt: currentDateTime
        });

        res.status(200).send({
            message: "Compte d'utilisateur désactivé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Une erreur est survenue lors de la désactivation du compte d'utilisateur",
            error: error.message,
        });
    }
};

// activate a specific user
exports.activateUser = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const uid = req.params.uid;
        const usersRef = admin.firestore().collection("users");
        const userDoc = await usersRef.doc(uid).get();

        // Check if the user exists
        if (!userDoc.exists) {
            res.status(404).send(
                `Aucun utilisateur trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        if (req.user.uid !== userDoc.id) {
            res.status(403).send({
                message: `Action non autorisée pour cet utilisateur`,
            });
            return;
        }

        // Activate user account
        await admin.auth().updateUser(uid, {
            disabled: false,
            updatedAt: currentDateTime
        });

        res.status(200).send({
            message: "Compte d'utilisateur activé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Une erreur est survenue lors de l'activation du compte d'utilisateur",
            error: error.message,
        });
    }
};
