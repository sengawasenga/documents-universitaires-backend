const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create an university
exports.createUniversity = async (req, res) => {
    try {
        const { name, address, description } = req.body;
        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const userId = req.user.uid;
        const currentDateTime = new Date();

        const universityRef = admin
            .firestore()
            .collection("universities")
            .doc();
        const university = {
            name,
            address,
            description,
            status: "active",
            userId,
            logo: [],
            createdAt: currentDateTime,
            updatedAt: currentDateTime,
        };

        // Upload images to Firebase Storage
        const promises = [];

        for (const file of req.files) {
            const fileName = file.originalname;
            const fileUpload = bucket.file(`universities/${uuid}-${fileName}`);
            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            promises.push(
                new Promise((resolve, reject) => {
                    blobStream.on("finish", async () => {
                        try {
                            await fileUpload.makePublic();
                            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                                bucket.name
                            }/o/${encodeURIComponent(
                                fileUpload.name
                            )}?alt=media`;
                            university.logo.push(imageUrl);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    });

                    blobStream.on("error", (error) => {
                        reject(error);
                    });

                    blobStream.end(file.buffer);
                })
            );
        }

        await Promise.all(promises);

        // Save university to Firestore
        await universityRef.set(university);

        res.send({
            message: "Université créée avec succès",
            university: {
                id: universityRef.id,
                name,
                address,
                description,
                status: university.status,
                userId,
                logo: university.logo,
                createdAt: university.createdAt,
                updatedAt: university.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating university:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de cette universite",
            error: error.message,
        });
    }
};

// update a specific university
exports.updateUniversity = async (req, res) => {
    try {
        const { name, address, description } = req.body;
        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const currentDateTime = new Date();

        const universityRef = admin.firestore().collection("universities");
        const universityDoc = await universityRef.doc(req.params.id).get();

        // Check if the user has permission to update an university
        if (req.user.uid !== universityDoc.data().userId) {
            res.status(403).send({
                message: `Cette action n'est pas autorisée pour cet utilisateur`,
            });
            return;
        }

        // Check if the university exists
        if (!universityDoc.exists) {
            res.status(404).send({
                message: `Cette université n'a pas été trouvée`,
            });
            return;
        }

        const university = {
            name,
            address,
            description,
            logo: universityDoc.data().logo,
            updatedAt: currentDateTime,
        };

        //  if the university had to deal with another image import
        if (req.files.length > 0) {
            // cleaning up a bit
            const promises = [];
            university.logo = [];

            await bucket.file(universityDoc.data().filename).delete();

            for (const file of req.files) {
                const fileName = file.originalname;
                const fileUpload = bucket.file(
                    `universities/${uuid}-${fileName}`
                );
                const blobStream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                promises.push(
                    new Promise((resolve, reject) => {
                        blobStream.on("finish", async () => {
                            try {
                                await fileUpload.makePublic();
                                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                                    bucket.name
                                }/o/${encodeURIComponent(
                                    fileUpload.name
                                )}?alt=media`;
                                university.logo.push(imageUrl);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        });

                        blobStream.on("error", (error) => {
                            reject(error);
                        });

                        blobStream.end(file.buffer);
                    })
                );
            }

            await Promise.all(promises);
        }

        // Update the university data with the validated request body
        await universityRef.doc(req.params.id).update(university);

        // Send the updated university data as a JSON response
        res.json({
            message: "Universite mise à jour avec succès!",
            uid: req.params.uid,
            author: "Owner",
        });
    } catch (error) {
        console.error("Error updating university:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la mise à jour de cette universite",
            error: error.message,
        });
    }
};

// get a list of universities
exports.getUniversities = async (req, res) => {
    try {
        // Retrieve the list of registered universities from Cloud Firestore
        const universitiesRef = admin.firestore().collection("universities");
        const universitiesSnapshot = await universitiesRef.get();
        const universities = [];

        // Loop through each document and add it to the categories array
        for (const doc of universitiesSnapshot.docs) {
            const userRef = await admin
                .firestore()
                .collection("users")
                .doc(doc.data().userId)
                .get();

            universities.push({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
                address: doc.data().address,
                logo: doc.data().logo,
                user: {
                    id: doc.data().userId,
                    name: userRef.data().name,
                    firstName: userRef.data().firstName,
                },
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        }

        // Paginate the list of universities
        const paginatedUniversities = paginate(
            universities,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of universities as a JSON response
        res.json(paginatedUniversities);
    } catch (error) {
        console.error("Error retrieving universities:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des universites",
            error: error.message,
        });
    }
};

// getting a specific university informations
exports.getUniversity = async (req, res) => {
    try {
        // Retrieve the university data from Cloud Firestore
        const universitiesRef = admin.firestore().collection("universities");
        const universityDoc = await universitiesRef.doc(req.params.id).get();
        const universityData = universityDoc.data();

        if (!universityDoc.exists) {
            return res.status(404).send({
                message: "Cette universite n'a pas été trouvée",
            });
        }

        const userRef = await admin
            .firestore()
            .collection("users")
            .doc(universityDoc.data().userId)
            .get();

        // Combine the university record and university data into a single object
        const university = {
            id: universityDoc.id,
            name: universityData.name,
            description: universityData.description,
            address: universityData.address,
            logo: universityData.logo,
            status: universityData.status,
            user: {
                id: universityDoc.data().userId,
                name: userRef.data().name,
                firstName: userRef.data().firstName,
            },
            createdAt: universityData.createdAt,
            updatedAt: universityData.updatedAt,
        };

        // Send the university object as a JSON response
        res.json(university);
    } catch (error) {
        console.error("Error retrieving university infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de cette universite`,
            error: error.message,
        });
    }
};

exports.deactivateUniversity = async (req, res) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const universitiesRef = admin.firestore().collection("universities");
        const universityDoc = await universitiesRef.doc(id).get();

        // Check if the university exists
        if (!universityDoc.exists) {
            res.status(404).send(
                `Aucune universite trouvée avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        if (req.user.uid !== userDoc.data().uid) {
            res.status(403).send({
                message: `Action non autorisée pour cet utilisateur`,
            });
            return;
        }

        // Deactivate the university
        await universitiesRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Universite désactivé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation de l'universite",
            error: error.message,
        });
    }
};

exports.activateUniversity = async (req, res) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const universitiesRef = admin.firestore().collection("universities");
        const universityDoc = await universitiesRef.doc(id).get();

        // Check if the university exists
        if (!universityDoc.exists) {
            res.status(404).send(
                `Aucune universite trouvée avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        if (req.user.uid !== userDoc.data().uid && req.user.role !== "admin") {
            res.status(403).send({
                message: `Action non autorisée pour cet utilisateur`,
            });
            return;
        }

        // Deactivate the university
        await universitiesRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Universite activé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation de l'universite",
            error: error.message,
        });
    }
};

exports.getFaculties = async (req, res) => {
    try {
        // Retrieve the list of registered faculties from Cloud Firestore
        const facultiesRef = admin.firestore().collection("faculties");
        const facultiesSnapshot = await facultiesRef
            .where("universityId", "==", req.params.id)
            .get();
        const faculties = [];

        // Loop through each document and add it to the faculties array
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

        // Paginate the list of course
        const paginatedFaculties = paginate(
            faculties,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of Faculties as a JSON response
        res.json(paginatedFaculties);
    } catch (error) {
        console.error("Error retrieving Facultiess list:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des facultes",
            error: error.message,
        });
    }
}

exports.getDepartments = async (req, res) => {
    try {
        const universityId = req.params.id;

        // Retrieve the list of faculties for the specific university
        const facultiesRef = admin.firestore().collection("faculties");
        const facultiesSnapshot = await facultiesRef
            .where("universityId", "==", universityId)
            .get();

        const departments = [];

        // Iterate through the faculties
        for (const facultyDoc of facultiesSnapshot.docs) {
            // Retrieve the list of departments for the current faculty
            const departmentsRef = admin.firestore().collection("departments");
            const departmentsSnapshot = await departmentsRef
                .where("facultyId", "==", facultyDoc.id)
                .get();

            // Iterate through the departments of the current faculty
            for (const departmentDoc of departmentsSnapshot.docs) {
                const departmentData = {
                    id: departmentDoc.id,
                    faculty: {
                        id: departmentDoc.data().facultyId,
                        name: facultyDoc.data().name,
                        description: facultyDoc.data().description,
                    },
                    ...departmentDoc.data(),
                };

                departments.push(departmentData);
            }
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
                "Une erreur est survenue lors de la récupération de la liste des départements",
            error: error.message,
        });
    }
};

exports.getClassrooms = async (req, res) => {
    try {
        const universityId = req.params.id;

        // Retrieve the list of faculties for the specific university
        const facultiesRef = admin.firestore().collection("faculties");
        const facultiesSnapshot = await facultiesRef
            .where("universityId", "==", universityId)
            .get();

        const classrooms = [];

        // Iterate through the faculties
        for (const facultyDoc of facultiesSnapshot.docs) {
            // Retrieve the list of departments for the current faculty
            const departmentsRef = admin.firestore().collection("departments");
            const departmentsSnapshot = await departmentsRef
                .where("facultyId", "==", facultyDoc.id)
                .get();

            // Iterate through the departments of the current faculty
            for (const departmentDoc of departmentsSnapshot.docs) {
                // Retrieve the list of classrooms for the current department
                const classroomsRef = admin
                    .firestore()
                    .collection("classrooms");
                const classroomsSnapshot = await classroomsRef
                    .where("departmentId", "==", departmentDoc.id)
                    .get();

                // Iterate through the classrooms of the current department
                for (const classroomDoc of classroomsSnapshot.docs) {
                    const classroomData = {
                        id: classroomDoc.id,
                        faculty: {
                            id: departmentDoc.data().facultyId,
                            name: facultyDoc.data().name,
                            description: facultyDoc.data().description,
                        },
                        department: {
                            id: classroomDoc.data().departmentId,
                            name: departmentDoc.data().name,
                            name: departmentDoc.data().name,
                        },
                        ...classroomDoc.data(),
                    };

                    classrooms.push(classroomData);
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

exports.getProfessors = async (req, res) => {
    try {
        const universityId = req.params.id;

        // Retrieve the list of professors for the specific university
        const professorsRef = admin.firestore().collection("professors");
        const professorsSnapshot = await professorsRef
            .where("universityId", "==", universityId)
            .get();

        const professors = [];

        // Iterate through the professors
        for (const professorDoc of professorsSnapshot.docs) {
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

            professors.push({
                id: professorDoc.id,
                status: professorDoc.data().status,
                user: {
                    id: professorDoc.data().universityId,
                    ...userRef.data(),
                },
                university: {
                    id: professorDoc.data().universityId,
                    name: universityRef.data().name,
                    description: universityRef.data().description,
                },
                createdAt: professorDoc.data().createdAt,
                updatedAt: professorDoc.data().updatedAt,
            });
        }

        // Paginate the list of professors
        const paginatedProfessors = paginate(
            professors,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of professors as a JSON response
        res.json(paginatedProfessors);
    } catch (error) {
        console.error("Error retrieving professors:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des professeurs",
            error: error.message,
        });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const universityId = req.params.id;

        // Retrieve the list of students for the specific university
        const studentsRef = admin.firestore().collection("students");
        const studentsSnapshot = await studentsRef
            .where("universityId", "==", universityId)
            .get();

        const students = [];

        // Iterate through the students
        for (const studentDoc of studentsSnapshot.docs) {
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

            students.push({
                id: studentDoc.id,
                status: studentDoc.data().status,
                user: {
                    id: studentDoc.data().universityId,
                    ...userRef.data(),
                },
                university: {
                    id: studentDoc.data().universityId,
                    name: universityRef.data().name,
                    description: universityRef.data().description,
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
                createdAt: studentDoc.data().createdAt,
                updatedAt: studentDoc.data().updatedAt,
            });
        }

        // Paginate the list of students
        const paginatedStudents = paginate(
            students,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of students as a JSON response
        res.json(paginatedStudents);
    } catch (error) {
        console.error("Error retrieving students:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des étudiants",
            error: error.message,
        });
    }
};


