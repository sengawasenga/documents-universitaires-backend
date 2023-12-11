const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create an cotation
exports.createCotation = async (req, res, next) => {
    try {
        const { rating, total, studentId, courseId, academicYearId } = req.body;
        const currentDateTime = new Date();

        // check if this user already has a cotation on this course
        const cotationCheck = await admin
            .firestore()
            .collection("cotations")
            .where("studentId", "==", studentId)
            .where("courseId", "==", courseId)
            .where("academicYearId", "==", academicYearId)
            .get()
        

        if (!cotationCheck.empty) {
            res.status(400).send({
                message: `Cet etudiant a déjà été coté dans ce cours`,
            });
            return;
        }

        const cotationRef = admin.firestore().collection("cotations").doc();
        const cotation = {
            rating,
            total,
            studentId,
            courseId,
            academicYearId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save cotation to Firestore
        await cotationRef.set(cotation);

        res.send({
            message: "Cotation créée avec succès",
            cotation: {
                id: cotationRef.id,
                rating,
                total,
                studentId,
                courseId,
                academicYearId,
                createdAt: cotation.createdAt,
                updatedAt: cotation.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating cotation:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de cette cotation",
            error: error.message,
        });
    }
};

// update a specific cotation
exports.updateCotation = async (req, res, next) => {
    try {
        const { rating, total } = req.body;
        const currentDateTime = new Date();

        const cotationRef = admin.firestore().collection("cotations");
        const cotationDoc = await cotationRef.doc(req.params.id).get();

        // Check if the cotation exists
        if (!cotationDoc.exists) {
            res.status(404).send({
                message: `Cette cotation n'a pas été trouvée`,
            });
            return;
        }

        const cotation = {
            rating,
            total,
            updatedAt: currentDateTime,
        };

        // Update the cotation data with the validated request body
        await cotationRef.doc(req.params.id).update(cotation);

        // Send the updated cotation data as a JSON response
        res.json({
            message: "Cotation mise à jour avec succès!",
            id: req.params.id,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating cotation:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de cette cotation",
            error: error.message,
        });
    }
};

// get a list of cotations
exports.getCotations = async (req, res) => {
    try {
        // Retrieve the list of registered cotations from Cloud Firestore
        const cotationsRef = admin.firestore().collection("cotations");
        const cotationsSnapshot = await cotationsRef.get();
        const cotations = [];

        // Loop through each document and add it to the cotation array
        for (const doc of cotationsSnapshot.docs) {
            const courseRef = await admin
                .firestore()
                .collection("courses")
                .doc(doc.data().courseId)
                .get();

            const academicYearRef = await admin
                .firestore()
                .collection("academicYears")
                .doc(doc.data().academicYearId)
                .get();

            const studentRef = await admin
                .firestore()
                .collection("students")
                .doc(doc.data().studentId)
                .get();

            cotations.push({
                id: doc.id,
                total: doc.data().total,
                rating: doc.data().rating,
                course: {
                    id: doc.data().courseId,
                    ...courseRef.data(),
                },
                academicYear: {
                    id: doc.data().academicYearId,
                    ...academicYearRef.data(),
                },
                student: {
                    id: doc.data().studentId,
                    ...studentRef.data(),
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of cotations
        const paginatedCotations = paginate(
            cotations,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of cotations as a JSON response
        res.json(paginatedCotations);
    } catch (error) {
        console.error("Error retrieving cotations:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des cotations",
            error: error.message,
        });
    }
};

// getting a specific cotation informations
exports.getCotation = async (req, res, next) => {
    try {
        // Retrieve the university data from Cloud Firestore
        const cotationsRef = admin.firestore().collection("cotations");
        const cotationDoc = await cotationsRef.doc(req.params.id).get();
        const cotationData = cotationDoc.data();

        if (!cotationDoc.exists) {
            return res.status(404).send({
                message: "Cette cotation n'a pas été trouvée",
            });
        }

        const courseRef = await admin
            .firestore()
            .collection("courses")
            .doc(cotationData.courseId)
            .get();

        const academicYearRef = await admin
            .firestore()
            .collection("academicYears")
            .doc(cotationData.academicYearId)
            .get();

        const studentRef = await admin
            .firestore()
            .collection("students")
            .doc(cotationData.studentId)
            .get();

        // Combine the cotation record and cotation data into a single object
        const cotation = {
            id: cotationDoc.id,
            rating: cotationData.rating,
            total: cotationData.total,
            course: {
                id: cotationData.courseId,
                ...courseRef.data(),
            },
            academicYear: {
                id: cotationData.academicYearId,
                ...academicYearRef.data(),
            },
            student: {
                id: cotationData.studentId,
                ...studentRef.data(),
            },
            createdAt: cotationData.createdAt,
            updatedAt: cotationData.updatedAt,
        };

        // Send the cotation object as a JSON response
        res.json(cotation);
    } catch (error) {
        console.error("Error retrieving cotation infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de cette cotation`,
            error: error.message,
        });
    }
};
