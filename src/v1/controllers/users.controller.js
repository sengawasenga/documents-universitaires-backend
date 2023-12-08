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
            telephone: userData.telephone,
            address: userData.address,
            sexe: userData.sexe,
            accountType: userData.role,
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
