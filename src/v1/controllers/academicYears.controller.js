const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create an academicYear
exports.createAcademicYear = async (req, res, next) => {
    try {
        const { name, universityId } = req.body;
        const currentDateTime = new Date();

        // Set all existing academic years to 'inactive'
        const allAcademicYearsSnapshot = await admin.firestore()
            .collection("academicYears")
            .get();
        const batch = admin.firestore().batch();

        allAcademicYearsSnapshot.forEach((doc) => {
            const academicYearRef = admin.firestore().collection("academicYears").doc(doc.id);
            batch.update(academicYearRef, { status: "inactive" });
        });

        await batch.commit();

        // create a brand new academic year
        const academicYearRef = admin
            .firestore()
            .collection("academicYears")
            .doc();
        const academicYear = {
            name,
            status: "active",
            universityId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save academicYear to Firestore
        await academicYearRef.set(academicYear);

        res.send({
            message: "Annee academique créé avec succès",
            academicYear: {
                id: academicYearRef.id,
                name,
                status: academicYear.status,
                universityId,
                createdAt: academicYear.createdAt,
                updatedAt: academicYear.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating academicYear:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de cette annee academique",
            error: error.message,
        });
    }
};

// update a specific academicYear
exports.updateAcademicYear = async (req, res, next) => {
    try {
        const { name } = req.body;
        const currentDateTime = new Date();

        const academicYearRef = admin.firestore().collection("academicYears");
        const academicYearDoc = await academicYearRef.doc(req.params.id).get();

        // Check if the user has permission to update this academicYear
        // if (req.user.uid !== academicYearDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the academicYear exists
        if (!academicYearDoc.exists) {
            res.status(404).send({
                message: `Cette annee academique n'a pas été trouvé`,
            });
            return;
        }

        const academicYear = {
            name,
            updatedAt: currentDateTime,
        };

        // Update the academicYear data with the validated request body
        await academicYearRef.doc(req.params.id).update(academicYear);

        // Send the updated academicYear data as a JSON response
        res.json({
            message: "Annee academique mis à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating academicYear:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de cette annee academique",
            error: error.message,
        });
    }
};

// get a list of academicYear
exports.getAcademicYears = async (req, res) => {
    try {
        // Retrieve the list of registered academicYear from Cloud Firestore
        const academicYearRef = admin.firestore().collection("academicYear");
        const academicYearSnapshot = await academicYearRef.get();
        const academicYear = [];

        // Loop through each document and add it to the categories array
        for (const doc of academicYearSnapshot.docs) {
            const universityRef = await admin
                .firestore()
                .collection("universities")
                .doc(doc.data().universityId)
                .get();

            academicYear.push({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
                university: {
                    id: doc.data().universityId,
                    name: universityRef.data().name,
                    description: universityRef.data().description,
                    logo: universityRef.data().logo,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of academicYear
        const paginatedAcademicYear = paginate(
            academicYear,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of academicYear as a JSON response
        res.json(paginatedAcademicYear);
    } catch (error) {
        console.error("Error retrieving academicYear:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des annees academiques",
            error: error.message,
        });
    }
};

// getting a specific academicYear informations
exports.getAcademicYear = async (req, res, next) => {
    try {
        // Retrieve the academicYear data from Cloud Firestore
        const academicYearsRef = admin.firestore().collection("academicYears");
        const academicYearDoc = await academicYearsRef.doc(req.params.id).get();
        const academicYearData = academicYearDoc.data();

        if (!academicYearDoc.exists) {
            return res.status(404).send({
                message: "Cette annee academique n'a pas été trouvé",
            });
        }

        const departmentRef = await admin
            .firestore()
            .collection("departments")
            .doc(academicYearDoc.data().departmentId)
            .get();

        // Combine the academicYear record and academicYear data into a single object
        const academicYear = {
            id: academicYearDoc.id,
            name: academicYearData.name,
            status: academicYearData.status,
            department: {
                id: departmentDoc.data().departmentId,
                name: departmentRef.data().name,
                description: departmentRef.data().description,
            },
            createdAt: academicYearData.createdAt,
            updatedAt: academicYearData.updatedAt,
        };

        // Send the academicYear object as a JSON response
        res.json(academicYear);
    } catch (error) {
        console.error("Error retrieving academicYear infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de l'annee academique`,
            error: error.message,
        });
    }
};

exports.deactivateAcademicYear = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const academicYearsRef = admin.firestore().collection("academicYears");
        const academicYearDoc = await academicYearsRef.doc(id).get();

        // Check if the academicYear exists
        if (!academicYearDoc.exists) {
            res.status(404).send(`Aucune annee academique trouvée avec cet identifiant`);
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== academicYearDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the academicYear
        await academicYearsRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Annee acdemique désactivée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation de l'annee academique",
            error: error.message,
        });
    }
};

exports.activateAcademicYear = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const academicYearsRef = admin.firestore().collection("academicYears");
        const academicYearDoc = await academicYearsRef.doc(id).get();

        // Check if the academicYear exists
        if (!academicYearDoc.exists) {
            res.status(404).send(
                `Aucune annee academique trouvée avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== academicYearDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Set all existing academic years to 'inactive'
        const allAcademicYearsSnapshot = await admin
            .firestore()
            .collection("academicYears")
            .get();
        const batch = admin.firestore().batch();

        allAcademicYearsSnapshot.forEach((doc) => {
            const academicYearRef = admin
                .firestore()
                .collection("academicYears")
                .doc(doc.id);
            batch.update(academicYearRef, { status: "inactive" });
        });

        await batch.commit();

        // activate the academicYear
        await academicYearsRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Annee academique activée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation de l'annee academique",
            error: error.message,
        });
    }
};
