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
