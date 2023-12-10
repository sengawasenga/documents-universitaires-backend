const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create an cotation
exports.createCotation = async (req, res, next) => {
    try {
        const { rating, total, studentId, courseId, academicYearId } = req.body;
        const currentDateTime = new Date();

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
        const { rating, total, studentId, courseId, academicYearId } = req.body;
        const currentDateTime = new Date();

        const cotationRef = admin.firestore().collection("universities");
        const cotationDoc = await cotationRef.doc(req.params.id).get();

        // Check if the university exists
        if (!cotationDoc.exists) {
            res.status(404).send({
                message: `Cette cotation n'a pas été trouvée`,
            });
            return;
        }

        const cotation = {
            rating,
            total,
            studentId,
            courseId,
            academicYearId,
            updatedAt: currentDateTime,
        };

        // Update the cotation data with the validated request body
        await cotationRef.doc(req.params.id).update(cotation);

        // Send the updated cotation data as a JSON response
        res.json({
            message: "Cotation mise à jour avec succès!",
            uid: req.params.uid,
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

        // Combine the cotation record and cotation data into a single object
        const cotation = {
            id: cotationDoc.id,
            rating: cotationData.rating,
            total: cotationData.total,
            course: {
                id: cotationDoc.courseId,
                ...courseRef.data(),
            },
            academicYear: {
                id: cotationDoc.academicYearId,
                ...academicYearRef.data(),
            },
            student: {
                id: cotationDoc.studentId,
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
