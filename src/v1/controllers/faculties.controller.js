const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create a faculty
exports.createFaculty = async (req, res, next) => {
    try {
        const { name, universityId, description } = req.body;
        const currentDateTime = new Date();

        const facultyRef = admin
            .firestore()
            .collection("universities")
            .doc();
        const faculty = {
            name,
            description,
            status: "active",
            universityId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save faculty to Firestore
        await facultyRef.set(faculty);

        res.send({
            message: "Université créée avec succès",
            faculty: {
                id: facultyRef.id,
                name,
                description,
                status: faculty.status,
                universityId,
                createdAt: faculty.createdAt,
                updatedAt: faculty.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating faculty:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de cette faculte",
            error: error.message,
        });
    }
};

// update a specific faculty
exports.updateFaculty = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const currentDateTime = new Date();

        const facultyRef = admin.firestore().collection("universities");
        const facultyDoc = await facultyRef.doc(req.params.id).get();

        // Check if the user has permission to update an faculty
        // if (req.user.uid !== facultyDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the faculty exists
        if (!facultyDoc.exists) {
            res.status(404).send({
                message: `Cette faculté n'a pas été trouvée`,
            });
            return;
        }

        const faculty = {
            name,
            description,
            updatedAt: currentDateTime,
        };

        // Update the faculty data with the validated request body
        await facultyRef.doc(req.params.id).update(faculty);

        // Send the updated faculty data as a JSON response
        res.json({
            message: "Publication mise à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating faculty:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de cette faculte",
            error: error.message,
        });
    }
};

// get a list of faculties
exports.getFaculties = async (req, res) => {
    try {
        // Retrieve the list of registered faculties from Cloud Firestore
        const facultiesRef = admin.firestore().collection("faculties");
        const facultiesSnapshot = await facultiesRef.get();
        const faculties = [];

        // Loop through each document and add it to the categories array
        for (const doc of facultiesSnapshot.docs) {
            const universityRef = await admin
                .firestore()
                .collection("universities")
                .doc(doc.data().universityId)
                .get();

            faculties.push({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
                university: {
                    id: doc.data().universityId,
                    name: universityRef.data().name,
                    description: universityRef.data().description,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of faculties
        const paginatedFaculties = paginate(
            faculties,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of faculties as a JSON response
        res.json(paginatedFaculties);
    } catch (error) {
        console.error("Error retrieving faculties:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des facultes",
            error: error.message,
        });
    }
};

// getting a specific faculty informations
exports.getFaculty = async (req, res, next) => {
    try {
        // Retrieve the faculty data from Cloud Firestore
        const facultiesRef = admin.firestore().collection("faculties");
        const facultyDoc = await facultiesRef.doc(req.params.id).get();
        const facultyData = facultyDoc.data();

        if (!facultyDoc.exists) {
            return res.status(404).send({
                message: "Cette faculte n'a pas été trouvée",
            });
        }

        const universityRef = await admin
            .firestore()
            .collection("universities")
            .doc(facultyDoc.data().universityId)
            .get();

        // Combine the faculty record and faculty data into a single object
        const faculty = {
            id: facultyDoc.id,
            name: facultyData.name,
            description: facultyData.description,
            address: facultyData.address,
            logo: facultyData.logo,
            status: facultyData.status,
            university: {
                id: facultyDoc.data().universityId,
                name: universityRef.data().name,
                firstName: universityRef.data().firstName,
            },
            createdAt: facultyData.createdAt,
            updatedAt: facultyData.updatedAt,
        };

        // Send the faculty object as a JSON response
        res.json(faculty);
    } catch (error) {
        console.error("Error retrieving faculty infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de cette faculte`,
            error: error.message,
        });
    }
};

exports.deactivateFaculty = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const facultiesRef = admin.firestore().collection("faculties");
        const facultyDoc = await facultiesRef.doc(id).get();

        // Check if the faculty exists
        if (!facultyDoc.exists) {
            res.status(404).send(
                `Aucune universite trouvée avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== facultyDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the faculty
        await facultiesRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Faculte désactivé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation de la faculte",
            error: error.message,
        });
    }
};

exports.activateFaculty = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const facultiesRef = admin.firestore().collection("faculties");
        const facultyDoc = await facultiesRef.doc(id).get();

        // Check if the faculty exists
        if (!facultyDoc.exists) {
            res.status(404).send(
                `Aucune faculte trouvée avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== facultyDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the faculty
        await facultiesRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Faculte activée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation de la faculte",
            error: error.message,
        });
    }
};
