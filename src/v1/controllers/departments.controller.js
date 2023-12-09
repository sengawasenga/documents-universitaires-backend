const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create a department
exports.createDepartment = async (req, res, next) => {
    try {
        const { name, facultyId, description } = req.body;
        const currentDateTime = new Date();

        const departmentRef = admin.firestore().collection("departments").doc();
        const department = {
            name,
            description,
            status: "active",
            facultyId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save department to Firestore
        await departmentRef.set(department);

        res.send({
            message: "Department créé avec succès",
            department: {
                id: departmentRef.id,
                name,
                description,
                status: department.status,
                facultyId,
                createdAt: department.createdAt,
                updatedAt: department.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de ce departement",
            error: error.message,
        });
    }
};

// update a specific department
exports.updateDepartment = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const currentDateTime = new Date();

        const departmentRef = admin.firestore().collection("departments");
        const departmentDoc = await departmentRef.doc(req.params.id).get();

        // Check if the user has permission to update this department
        // if (req.user.uid !== departmentDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the department exists
        if (!departmentDoc.exists) {
            res.status(404).send({
                message: `Ce departement n'a pas été trouvée`,
            });
            return;
        }

        const department = {
            name,
            description,
            updatedAt: currentDateTime,
        };

        // Update the department data with the validated request body
        await departmentRef.doc(req.params.id).update(department);

        // Send the updated department data as a JSON response
        res.json({
            message: "Departement mis à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating department:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de ce departement",
            error: error.message,
        });
    }
};

// get a list of departments
exports.getDepartments = async (req, res) => {
    try {
        // Retrieve the list of registered departments from Cloud Firestore
        const departmentsRef = admin.firestore().collection("departments");
        const departmentsSnapshot = await departmentsRef.get();
        const departments = [];

        // Loop through each document and add it to the categories array
        for (const doc of departmentsSnapshot.docs) {
            const facultyRef = await admin
                .firestore()
                .collection("faculties")
                .doc(doc.data().facultyId)
                .get();

            departments.push({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
                faculty: {
                    id: doc.data().facultyId,
                    name: facultyRef.data().name,
                    description: facultyRef.data().description,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of departments
        const paginatedDepartments = paginate(
            departments,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of departments as a JSON response
        res.json(paginatedDepartments);
    } catch (error) {
        console.error("Error retrieving departments:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des departements",
            error: error.message,
        });
    }
};

// getting a specific department informations
exports.getDepartment = async (req, res, next) => {
    try {
        // Retrieve the department data from Cloud Firestore
        const departmentsRef = admin.firestore().collection("departments");
        const departmentDoc = await departmentsRef.doc(req.params.id).get();
        const departmentData = departmentDoc.data();

        if (!departmentDoc.exists) {
            return res.status(404).send({
                message: "Ce departement n'a pas été trouvé",
            });
        }

        const facultyRef = await admin
            .firestore()
            .collection("faculties")
            .doc(departmentDoc.data().facultyId)
            .get();

        // Combine the department record and department data into a single object
        const department = {
            id: departmentDoc.id,
            name: departmentData.name,
            description: departmentData.description,
            status: departmentData.status,
            faculty: {
                id: departmentDoc.data().facultyId,
                name: facultyRef.data().name,
                description: facultyRef.data().description,
            },
            createdAt: departmentData.createdAt,
            updatedAt: departmentData.updatedAt,
        };

        // Send the department object as a JSON response
        res.json(department);
    } catch (error) {
        console.error("Error retrieving department infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de ce departement`,
            error: error.message,
        });
    }
};

exports.deactivateDepartment = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const departmentsRef = admin.firestore().collection("departments");
        const departmentDoc = await departmentsRef.doc(id).get();

        // Check if the department exists
        if (!departmentDoc.exists) {
            res.status(404).send(
                `Aucun departement trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== departmentDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the department
        await departmentsRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Departement désactivé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation du departement",
            error: error.message,
        });
    }
};

exports.activateDepartment = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const departmentsRef = admin.firestore().collection("departments");
        const departmentDoc = await departmentsRef.doc(id).get();

        // Check if the department exists
        if (!departmentDoc.exists) {
            res.status(404).send(
                `Aucun departement trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== departmentDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the department
        await departmentsRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Departement activée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation du departement",
            error: error.message,
        });
    }
};

exports.getClassrooms = async (req, res) => {
    try {
        const departmentId = req.params.id;

        const departmentsRef = admin.firestore().collection("departments");
        const departmentDoc = await departmentsRef.doc(departmentId).get();

        if (!departmentDoc.exists) {
            return res.status(404).send({
                message: "Ce departement n'a pas été trouvé",
            });
        }

        // Récupérez les auditoires associés au departement
        const classroomsSnapshot = await admin
            .firestore()
            .collection("classrooms")
            .where("departmentId", "==", departmentId)
            .get();
        const classrooms = [];

        classroomsSnapshot.forEach((doc) => {
            classrooms.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Paginate the list of classrooms
        const paginatedClassrooms = paginate(
            classrooms,
            req.query.page,
            req.query.limit
        );

        return res.status(200).json(paginatedClassrooms);
    } catch (error) {
        console.error(
            "Error while retrieving departments classrooms list:",
            error
        );
        return res.status(500).json({
            message:
                "Une erreur est survenue lors de la recuperation de la liste des auditoires",
            error: error.message,
        });
    }
};
