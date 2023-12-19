const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create a professor
exports.createProfessor = async (req, res, next) => {
    try {
        const { userId, universityId } = req.body;
        const currentDateTime = new Date();

        // create a brand new professor
        const professorRef = admin.firestore().collection("professors").doc();
        const professor = {
            userId,
            status: "active",
            inscriptionStatus: "in-progress",
            universityId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save professor to Firestore
        await professorRef.set(professor);

        res.send({
            message: "Professeur créé avec succès",
            professor: {
                id: professorRef.id,
                userId,
                status: professor.status,
                inscriptionStatus: professor.inscriptionStatus,
                universityId,
                createdAt: professor.createdAt,
                updatedAt: professor.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating professor:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création du professeur",
            error: error.message,
        });
    }
};

// update a specific professor
exports.updateProfessor = async (req, res, next) => {
    try {
        const { universityId } = req.body;
        const currentDateTime = new Date();

        const professorRef = admin.firestore().collection("professors");
        const professorDoc = await professorRef.doc(req.params.id).get();

        // Check if the user has permission to update this professor
        // if (req.user.uid !== professorDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the professor exists
        if (!professorDoc.exists) {
            res.status(404).send({
                message: `Ce professeur n'a pas été trouvé`,
            });
            return;
        }

        const professor = {
            universityId,
            updatedAt: currentDateTime,
        };

        // Update the professor data with the validated request body
        await professorRef.doc(req.params.id).update(professor);

        // Send the updated professor data as a JSON response
        res.json({
            message: "Professeur mis à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating professor:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de ce professeur",
            error: error.message,
        });
    }
};

// get a list of professor
exports.getProfessors = async (req, res) => {
    try {
        // Retrieve the list of registered professor from Cloud Firestore
        const professorRef = admin.firestore().collection("professors");
        const professorSnapshot = await professorRef.get();
        const professor = [];

        // Loop through each document and add it to the categories array
        for (const doc of professorSnapshot.docs) {
            const universityRef = await admin
                .firestore()
                .collection("universities")
                .doc(doc.data().universityId)
                .get();

            const userRef = await admin
                .firestore()
                .collection("users")
                .doc(doc.data().userId)
                .get();

            professor.push({
                id: doc.id,
                status: doc.data().status,
                user: {
                    id: doc.data().universityId,
                    ...userRef.data(),
                },
                university: {
                    id: doc.data().universityId,
                    name: universityRef.data().name,
                    description: universityRef.data().description,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of professor
        const paginatedProfessor = paginate(
            professor,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of professor as a JSON response
        res.json(paginatedProfessor);
    } catch (error) {
        console.error("Error retrieving professor:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des professeurs",
            error: error.message,
        });
    }
};

// getting a specific professor informations
exports.getProfessor = async (req, res, next) => {
    try {
        // Retrieve the professor data from Cloud Firestore
        const professorsRef = admin.firestore().collection("professors");
        const professorDoc = await professorsRef.doc(req.params.id).get();
        const professorData = professorDoc.data();

        if (!professorDoc.exists) {
            return res.status(404).send({
                message: "Ce professeur n'a pas été trouvé",
            });
        }

        const universityRef = await admin
            .firestore()
            .collection("universities")
            .doc(professorDoc.data().universityId)
            .get();

        const userRef = await admin
            .firestore()
            .collection("users")
            .doc(professorDoc.data().userId)
            .get();

        // Combine the professor record and professor data into a single object
        const professor = {
            id: professorDoc.id,
            status: professorData.status,
            user: {
                id: professorDoc.data().universityId,
                ...userRef.data(),
            },
            university: {
                id: professorDoc.data().universityId,
                name: universityRef.data().name,
                description: universityRef.data().description,
                logo: universityRef.data().logo,
            },
            createdAt: professorData.createdAt,
            updatedAt: professorData.updatedAt,
        };

        // Send the professor object as a JSON response
        res.json(professor);
    } catch (error) {
        console.error("Error retrieving professor infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération des infos du professeur`,
            error: error.message,
        });
    }
};

exports.deactivateProfessor = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const professorsRef = admin.firestore().collection("professors");
        const professorDoc = await professorsRef.doc(id).get();

        // Check if the professor exists
        if (!professorDoc.exists) {
            res.status(404).send(
                `Aucun professeur trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== professorDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the professor
        await professorsRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Professeur désactivée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation du professeur",
            error: error.message,
        });
    }
};

exports.activateProfessor = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const professorsRef = admin.firestore().collection("professors");
        const professorDoc = await professorsRef.doc(id).get();

        // Check if the professor exists
        if (!professorDoc.exists) {
            res.status(404).send(
                `Aucun professeur trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== professorDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // activate the professor
        await professorsRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Professeur activé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation du professeur",
            error: error.message,
        });
    }
};

exports.approveProfessor = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const professorsRef = admin.firestore().collection("professors");
        const professorDoc = await professorsRef.doc(id).get();

        // Check if the professor exists
        if (!professorDoc.exists) {
            res.status(404).send(
                `Aucun professeur trouvé avec cet identifiant`
            );
            return;
        }

        // activate the professor
        await professorsRef
            .doc(id)
            .update({ inscriptionStatus: "approved", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Professeur approuvé avec succès",
            author: "Admin",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation du professeur",
            error: error.message,
        });
    }
};

exports.declineProfessor = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const professorsRef = admin.firestore().collection("professors");
        const professorDoc = await professorsRef.doc(id).get();

        // Check if the professor exists
        if (!professorDoc.exists) {
            res.status(404).send(
                `Aucun professeur trouvé avec cet identifiant`
            );
            return;
        }

        // activate the professor
        await professorsRef
            .doc(id)
            .update({
                inscriptionStatus: "declined",
                updatedAt: currentDateTime,
            });

        res.status(200).send({
            message: "Professeur décliné avec succès",
            author: "Admin",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation du professeur",
            error: error.message,
        });
    }
};

// get a list of course
exports.getCourses = async (req, res) => {
    try {
        // Retrieve the list of registered course from Cloud Firestore
        const courseRef = admin.firestore().collection("courses");
        const courseSnapshot = await courseRef
            .where("professorId", "==", req.params.id)
            .get();
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
                classroom: {
                    id: doc.data().classroomId,
                    ...classroomRef.data(),
                },
                professor: {
                    id: doc.data().professorId,
                    ...professorRef.data(),
                },
                ...doc.data(),
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

// get a list of classrooms
exports.getClassrooms = async (req, res) => {
    try {
        // Retrieve the list of registered course from Cloud Firestore
        const courseRef = admin.firestore().collection("courses");
        const courseSnapshot = await courseRef
            .where("professorId", "==", req.params.id)
            .get();
        const classrooms = [];

        for (const doc of courseSnapshot.docs) {
            // Retrieve the list of registered classrooms from Cloud Firestore
            const classroomsRef = admin.firestore().collection("classrooms");
            const classroomsSnapshot = await classroomsRef.get();

            for (const classroomDoc of classroomsSnapshot.docs) {
                if (classroomDoc.id == doc.data().classroomId) {
                    const classroomData = {
                        id: doc.data().classroomId,
                        ...classroomDoc.data(),
                    };

                    if (
                        !classrooms.some((item) => item.id == classroomData.id)
                    ) {
                        classrooms.push(classroomData);
                    }
                }
            }
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

// get a list of students
exports.getStudents = async (req, res) => {
    try {
        // Retrieve the list of registered course from Cloud Firestore
        const courseRef = admin.firestore().collection("courses");
        const courseSnapshot = await courseRef
            .where("professorId", "==", req.params.id)
            .get();
        const classrooms = [];
        const students = [];

        for (const doc of courseSnapshot.docs) {
            // Retrieve the list of registered classrooms from Cloud Firestore
            const classroomsRef = admin.firestore().collection("classrooms");
            const classroomsSnapshot = await classroomsRef.get();

            for (const classroomDoc of classroomsSnapshot.docs) {
                if (classroomDoc.id == doc.data().classroomId) {
                    const classroomData = {
                        id: doc.data().classroomId,
                    };

                    if (
                        !classrooms.some((item) => item.id == classroomData.id)
                    ) {
                        classrooms.push(classroomData);
                    }
                }
            }
        }

        // get the students list
        const studentRef = admin.firestore().collection("students");
        const studentSnapshot = await studentRef.get();

        for (const doc of studentSnapshot.docs) {
            const universityRef = await admin
                .firestore()
                .collection("universities")
                .doc(doc.data().universityId)
                .get();
            const facultyRef = await admin
                .firestore()
                .collection("faculties")
                .doc(doc.data().facultyId)
                .get();
            const departmentRef = await admin
                .firestore()
                .collection("departments")
                .doc(doc.data().departmentId)
                .get();
            const classroomRef = await admin
                .firestore()
                .collection("classrooms")
                .doc(doc.data().classroomId)
                .get();

            const userRef = await admin
                .firestore()
                .collection("users")
                .doc(doc.data().userId)
                .get();

            if (classrooms.some((item) => item.id == doc.data().classroomId)) {
                students.push({
                    id: doc.id,
                    status: doc.data().status,
                    user: {
                        id: doc.data().universityId,
                        ...userRef.data(),
                    },
                    university: {
                        id: doc.data().universityId,
                        name: universityRef.data().name,
                        description: universityRef.data().description,
                    },
                    faculty: {
                        id: doc.data().facultyId,
                        name: facultyRef.data().name,
                    },
                    department: {
                        id: doc.data().departmentId,
                        name: departmentRef.data().name,
                    },
                    classroom: {
                        id: doc.data().classroomId,
                        name: facultyRef.data().name,
                    },
                    createdAt: doc.data().createdAt,
                    updatedAt: doc.data().updatedAt,
                });
            }
        }

        // Paginate the list of students
        const paginatedStudents = paginate(
            students,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of Students as a JSON response
        res.json(paginatedStudents);
    } catch (error) {
        console.error("Error retrieving classrooms:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des auditoires",
            error: error.message,
        });
    }
};
