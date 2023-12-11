const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create a student
exports.createStudent = async (req, res, next) => {
    try {
        const { userId, universityId, facultyId, departmentId, classroomId } =
            req.body;
        const currentDateTime = new Date();

        // create a brand new student
        const studentRef = admin.firestore().collection("students").doc();
        const student = {
            userId,
            status: "active",
            universityId,
            facultyId,
            departmentId,
            classroomId,
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Save student to Firestore
        await studentRef.set(student);

        res.send({
            message: "Etudiant créé avec succès",
            student: {
                id: studentRef.id,
                userId,
                status: student.status,
                universityId,
                facultyId,
                departmentId,
                classroomId,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de l'etudiant",
            error: error.message,
        });
    }
};

// update a specific student
exports.updateStudent = async (req, res, next) => {
    try {
        const { universityId, facultyId, departmentId, classroomId } = req.body;
        const currentDateTime = new Date();

        const studentRef = admin.firestore().collection("students");
        const studentDoc = await studentRef.doc(req.params.id).get();

        // Check if the user has permission to update this student
        // if (req.user.uid !== studentDoc.data().userId) {
        //     res.status(403).send({
        //         message: `Cette action n'est pas autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Check if the student exists
        if (!studentDoc.exists) {
            res.status(404).send({
                message: `Cet etudiant n'a pas été trouvé`,
            });
            return;
        }

        const student = {
            universityId,
            facultyId,
            departmentId,
            classroomId,
            updatedAt: currentDateTime,
        };

        // Update the student data with the validated request body
        await studentRef.doc(req.params.id).update(student);

        // Send the updated student data as a JSON response
        res.json({
            message: "Etudiant mis à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de cet etudiant",
            error: error.message,
        });
    }
};

// get a list of student
exports.getStudents = async (req, res) => {
    try {
        // Retrieve the list of registered student from Cloud Firestore
        const studentRef = admin.firestore().collection("students");
        const studentSnapshot = await studentRef.get();
        const student = [];

        // Loop through each document and add it to the students array
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

            student.push({
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
                    name: classroomRef.data().name,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of student
        const paginatedStudent = paginate(
            student,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of student as a JSON response
        res.json(paginatedStudent);
    } catch (error) {
        console.error("Error retrieving students list:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des etudiants",
            error: error.message,
        });
    }
};

// getting a specific student informations
exports.getStudent = async (req, res, next) => {
    try {
        // Retrieve the student data from Cloud Firestore
        const studentsRef = admin.firestore().collection("students");
        const studentDoc = await studentsRef.doc(req.params.id).get();
        const studentData = studentDoc.data();

        if (!studentDoc.exists) {
            return res.status(404).send({
                message: "Cet etudiant n'a pas été trouvé",
            });
        }

        const universityRef = await admin
            .firestore()
            .collection("universities")
            .doc(studentDoc.data().universityId)
            .get();
        const facultyRef = await admin
            .firestore()
            .collection("faculties")
            .doc(studentDoc.data().facultyId)
            .get();
        const departmentRef = await admin
            .firestore()
            .collection("departments")
            .doc(studentDoc.data().departmentId)
            .get();
        const classroomRef = await admin
            .firestore()
            .collection("classrooms")
            .doc(studentDoc.data().classroomId)
            .get();

        const userRef = await admin
            .firestore()
            .collection("users")
            .doc(studentDoc.data().userId)
            .get();

        // Combine the student record and student data into a single object
        const student = {
            id: studentDoc.id,
            status: studentData.status,
            user: {
                id: studentDoc.data().universityId,
                ...userRef.data(),
            },
            university: {
                id: studentDoc.data().universityId,
                name: universityRef.data().name,
                description: universityRef.data().description,
                logo: universityRef.data().logo,
            },
            faculty: {
                id: studentDoc.data().facultyId,
                name: facultyRef.data().name,
            },
            department: {
                id: studentDoc.data().departmentId,
                name: departmentRef.data().name,
            },
            classroom: {
                id: studentDoc.data().classroomId,
                name: classroomRef.data().name,
            },
            createdAt: studentData.createdAt,
            updatedAt: studentData.updatedAt,
        };

        // Send the student object as a JSON response
        res.json(student);
    } catch (error) {
        console.error("Error retrieving student infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération des infos de l'etudiant`,
            error: error.message,
        });
    }
};

exports.deactivateStudent = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const studentsRef = admin.firestore().collection("students");
        const studentDoc = await studentsRef.doc(id).get();

        // Check if the student exists
        if (!studentDoc.exists) {
            res.status(404).send(`Aucun etudiant trouvé avec cet identifiant`);
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== studentDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the student
        await studentsRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Etudiant désactivée avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation de l'etudiant",
            error: error.message,
        });
    }
};

exports.activateStudent = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const studentsRef = admin.firestore().collection("students");
        const studentDoc = await studentsRef.doc(id).get();

        // Check if the student exists
        if (!studentDoc.exists) {
            res.status(404).send(`Aucun etudiant trouvé avec cet identifiant`);
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== studentDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // activate the student
        await studentsRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Etudiant activé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation de l'etudiant",
            error: error.message,
        });
    }
};
