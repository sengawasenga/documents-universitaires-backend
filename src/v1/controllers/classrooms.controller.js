const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create a classroom
exports.createClassroom = async (req, res, next) => {
    try {
        const { name, departmentId } = req.body;
        const currentDateTime = new Date();

        const classroomRef = admin.firestore().collection("classrooms").doc();
        const classroom = {
            name,
            status: "active",
            departmentId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save classroom to Firestore
        await classroomRef.set(classroom);

        res.send({
            message: "Auditoire créé avec succès",
            classroom: {
                id: classroomRef.id,
                name,
                status: classroom.status,
                departmentId,
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating classroom:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de cet auditoire",
            error: error.message,
        });
    }
};

// update a specific classroom
exports.updateClassroom = async (req, res, next) => {
    try {
        const { name } = req.body;
        const currentDateTime = new Date();

        const classroomRef = admin.firestore().collection("classrooms");
        const classroomDoc = await classroomRef.doc(req.params.id).get();

        // Check if the user has permission to update this classroom
        // if (req.user.uid !== classroomDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the classroom exists
        if (!classroomDoc.exists) {
            res.status(404).send({
                message: `Cet auditoire n'a pas été trouvé`,
            });
            return;
        }

        const classroom = {
            name,
            updatedAt: currentDateTime,
        };

        // Update the classroom data with the validated request body
        await classroomRef.doc(req.params.id).update(classroom);

        // Send the updated classroom data as a JSON response
        res.json({
            message: "Auditoire mis à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating classroom:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de cet auditoire",
            error: error.message,
        });
    }
};

// get a list of classrooms
exports.getClassrooms = async (req, res) => {
    try {
        // Retrieve the list of registered classrooms from Cloud Firestore
        const classroomsRef = admin.firestore().collection("classrooms");
        const classroomsSnapshot = await classroomsRef.get();
        const classrooms = [];

        // Loop through each document and add it to the categories array
        for (const doc of classroomsSnapshot.docs) {
            const departmentRef = await admin
                .firestore()
                .collection("departments")
                .doc(doc.data().departmentId)
                .get();

            classrooms.push({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
                department: {
                    id: doc.data().departmentId,
                    name: departmentRef.data().name,
                    description: departmentRef.data().description,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of classrooms
        const paginatedClassrooms = paginate(
            classrooms,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of classrooms as a JSON response
        res.json(paginatedClassrooms);
    } catch (error) {
        console.error("Error retrieving classrooms:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des auditoires",
            error: error.message,
        });
    }
};

// getting a specific classroom informations
exports.getClassroom = async (req, res, next) => {
    try {
        // Retrieve the classroom data from Cloud Firestore
        const classroomsRef = admin.firestore().collection("classrooms");
        const classroomDoc = await classroomsRef.doc(req.params.id).get();
        const classroomData = classroomDoc.data();

        if (!classroomDoc.exists) {
            return res.status(404).send({
                message: "Cet auditoire n'a pas été trouvé",
            });
        }

        const departmentRef = await admin
            .firestore()
            .collection("departments")
            .doc(classroomDoc.data().departmentId)
            .get();

        // Combine the classroom record and classroom data into a single object
        const classroom = {
            id: classroomDoc.id,
            name: classroomData.name,
            status: classroomData.status,
            department: {
                id: classroomDoc.data().departmentId,
                name: departmentRef.data().name,
                description: departmentRef.data().description,
            },
            createdAt: classroomData.createdAt,
            updatedAt: classroomData.updatedAt,
        };

        // Send the classroom object as a JSON response
        res.json(classroom);
    } catch (error) {
        console.error("Error retrieving classroom infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de cet auditoire`,
            error: error.message,
        });
    }
};

exports.deactivateClassroom = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const classroomsRef = admin.firestore().collection("classrooms");
        const classroomDoc = await classroomsRef.doc(id).get();

        // Check if the classroom exists
        if (!classroomDoc.exists) {
            res.status(404).send(
                `Aucun auditoire trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== classroomDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the classroom
        await classroomsRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Auditoire désactivé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation de l'auditoire",
            error: error.message,
        });
    }
};

exports.activateClassroom = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const classroomsRef = admin.firestore().collection("classrooms");
        const classroomDoc = await classroomsRef.doc(id).get();

        // Check if the classroom exists
        if (!classroomDoc.exists) {
            res.status(404).send(
                `Aucun auditoire trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== classroomDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the classroom
        await classroomsRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Auditoire activée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation de l'auditoire",
            error: error.message,
        });
    }
};
