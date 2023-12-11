const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create a course
exports.createCourse = async (req, res, next) => {
    try {
        const { name, classroomId, professorId, ponderation } = req.body;
        const currentDateTime = new Date();

        // create a brand new course
        const courseRef = admin.firestore().collection("courses").doc();
        const course = {
            name,
            ponderation,
            classroomId,
            professorId,
            status: "active",
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save course to Firestore
        await courseRef.set(course);

        res.send({
            message: "Cours créé avec succès",
            course: {
                id: courseRef.id,
                name,
                ponderation,
                classroomId,
                professorId,
                status: course.status,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création du cours",
            error: error.message,
        });
    }
};

// update a specific course
exports.updateCourse = async (req, res, next) => {
    try {
        const { name, classroomId, professorId, ponderation } = req.body;
        const currentDateTime = new Date();

        const courseRef = admin.firestore().collection("courses");
        const courseDoc = await courseRef.doc(req.params.id).get();

        // Check if the user has permission to update this course
        // if (req.user.uid !== courseDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the course exists
        if (!courseDoc.exists) {
            res.status(404).send({
                message: `Cet cours n'a pas été trouvé`,
            });
            return;
        }

        const course = {
            name,
            ponderation,
            classroomId,
            professorId,
            updatedAt: currentDateTime,
        };

        // Update the course data with the validated request body
        await courseRef.doc(req.params.id).update(course);

        // Send the updated course data as a JSON response
        res.json({
            message: "Cours mis à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de ce cours",
            error: error.message,
        });
    }
};

// get a list of course
exports.getCourses = async (req, res) => {
    try {
        // Retrieve the list of registered course from Cloud Firestore
        const courseRef = admin.firestore().collection("courses");
        const courseSnapshot = await courseRef.get();
        const course = [];

        // Loop through each document and add it to the courses array
        for (const doc of courseSnapshot.docs) {
            const classroomRef = await admin
                .firestore()
                .collection("classrooms")
                .doc(doc.data().classroomId)
                .get();

            const professorRef = await admin
                .firestore()
                .collection("professors")
                .doc(doc.data().professorId)
                .get();

            course.push({
                id: doc.id,
                status: doc.data().status,
                name: doc.data().name,
                ponderation: doc.data().ponderation,
                classroom: {
                    id: doc.data().classroomId,
                    ...classroomRef.data(),
                },
                professor: {
                    id: doc.data().professorId,
                    ...professorRef.data(),
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of course
        const paginatedCourse = paginate(
            course,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of course as a JSON response
        res.json(paginatedCourse);
    } catch (error) {
        console.error("Error retrieving courses list:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des cours",
            error: error.message,
        });
    }
};

// getting a specific course informations
exports.getCourse = async (req, res, next) => {
    try {
        // Retrieve the course data from Cloud Firestore
        const coursesRef = admin.firestore().collection("courses");
        const courseDoc = await coursesRef.doc(req.params.id).get();
        const courseData = courseDoc.data();

        if (!courseDoc.exists) {
            return res.status(404).send({
                message: "Ce cours n'a pas été trouvé",
            });
        }

        const classroomRef = await admin
            .firestore()
            .collection("classrooms")
            .doc(courseData.classroomId)
            .get();

        const professorRef = await admin
            .firestore()
            .collection("professors")
            .doc(courseData.professorId)
            .get();

        // Combine the course record and course data into a single object
        const course = {
            id: courseDoc.id,
            status: courseData.status,
            name: courseData.name,
            ponderation: courseData.ponderation,
            classroom: {
                id: courseData.classroomId,
                ...classroomRef.data(),
            },
            professor: {
                id: courseData.professorId,
                ...professorRef.data(),
            },
            createdAt: courseData.createdAt,
            updatedAt: courseData.updatedAt,
        };

        // Send the course object as a JSON response
        res.json(course);
    } catch (error) {
        console.error("Error retrieving course infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération des infos du cours`,
            error: error.message,
        });
    }
};

// deactivate a specific course
exports.deactivateCourse = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const coursesRef = admin.firestore().collection("courses");
        const courseDoc = await coursesRef.doc(id).get();

        // Check if the course exists
        if (!courseDoc.exists) {
            res.status(404).send(`Aucun cours trouvé avec cet identifiant`);
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== courseDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the course
        await coursesRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Cours désactivée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation du cours",
            error: error.message,
        });
    }
};

// activate a specific course
exports.activateCourse = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const coursesRef = admin.firestore().collection("courses");
        const courseDoc = await coursesRef.doc(id).get();

        // Check if the course exists
        if (!courseDoc.exists) {
            res.status(404).send(`Aucun cours trouvé avec cet identifiant`);
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== courseDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // activate the course
        await coursesRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Cours activé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation du cours",
            error: error.message,
        });
    }
};
