const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

const getStudentData = async (userId) => {
    try {
        console.log('userId', userId);
        if (!userId) {
            throw new Error("Invalid userId provided");
        }

        // Retrieve user data from the 'users' collection using userId
        const usersRef = admin.firestore().collection("users");
        const userSnapshot = await usersRef.doc(userId).get();

        if (userSnapshot.exists) {
            // Retrieve student data using userId in the 'students' collection
            const studentSnapshot = await admin
                .firestore()
                .collection("students")
                .where("userId", "==", userId)
                .get();

            if (!studentSnapshot.empty) {
                const combinedData = {
                    userId: userId,
                    studentId: studentSnapshot.docs[0].id,
                    ...userSnapshot.data(),
                };

                return combinedData;
            } else {
                throw new Error("Student data not found for the given userId");
            }
        } else {
            throw new Error("User data not found for the given userId");
        }
    } catch (error) {
        console.error("Error retrieving student data:", error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

const getUniversityData = async (universityId) => {
    try {
        // Retrieve user data from the 'universities' collection using universityId
        const universitiesRef = admin.firestore().collection("universities");
        const universitySnapshot = await universitiesRef
            .doc(universityId)
            .get();

        if (universitySnapshot.exists) {
            const combinedData = {
                universityId: universityId,
                ...universitySnapshot.data(),
            };

            return combinedData;
        } else {
            throw new Error(
                "University data not found for the given universityId"
            );
        }
    } catch (error) {
        console.error("Error retrieving university data:", error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

const getAcademicYearData = async (universityId) => {
    try {
        const academicYearsRef = admin.firestore().collection("academicYears");

        // Query the academicYears collection to find the active academic year for the given universityId
        const academicYearSnapshot = await academicYearsRef
            .where("universityId", "==", universityId)
            .where("status", "==", "active")
            .get();

        if (!academicYearSnapshot.empty) {
            // If a document is found, retrieve and return the data
            const academicYearDoc = academicYearSnapshot.docs[0];

            const combinedData = {
                id: academicYearDoc.id,
                ...academicYearDoc.data(),
            };

            return combinedData;
        } else {
            throw new Error(
                "Active academic year not found for the given universityId"
            );
        }
    } catch (error) {
        console.error("Error retrieving active academic year data:", error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

const getFacultyData = async (universityId) => {
    try {
        // Retrieve faculty data from the 'universities' collection using universityId
        const facultiesRef = admin.firestore().collection("faculties");
        const facultySnapshot = await facultiesRef
            .where("universityId", "==", universityId)
            .where("status", "==", "active")
            .get();

        if (!facultySnapshot.empty) {
            // Access the first document in the QuerySnapshot
            const firstFacultyDoc = facultySnapshot.docs[0];

            const combinedData = {
                facultyId: firstFacultyDoc.id,
                ...firstFacultyDoc.data(),
            };

            return combinedData;
        } else {
            throw new Error(
                "Faculty data not found for the given universityId"
            );
        }
    } catch (error) {
        console.error("Error retrieving faculty data:", error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

const getClassroomData = async (universityId) => {
    try {
        // Step 1: Retrieve the faculty data to get the facultyId
        const facultyData = await getFacultyData(universityId);

        // Step 2: Query the departments collection to find the departmentId for the faculty
        const departmentsCollection = admin
            .firestore()
            .collection("departments");
        const departmentSnapshot = await departmentsCollection
            .where("facultyId", "==", facultyData.facultyId)
            .get();

        if (!departmentSnapshot.empty) {
            // If a document is found, retrieve the departmentId
            const departmentDoc = departmentSnapshot.docs[0];
            const departmentId = departmentDoc.id;

            // Step 3: Query the classrooms collection to find the active classroom for the department
            const classroomsCollection = admin
                .firestore()
                .collection("classrooms");
            const classroomSnapshot = await classroomsCollection
                .where("departmentId", "==", departmentId)
                .where("status", "==", "active")
                .get();

            if (!classroomSnapshot.empty) {
                // If a document is found, retrieve and return the data
                const classroomDoc = classroomSnapshot.docs[0];
                const classroomData = classroomDoc.data();

                // Assuming the classroom data contains the necessary fields
                const combinedData = {
                    id: classroomDoc.id,
                    ...classroomDoc.data(),
                };

                return combinedData;
            } else {
                throw new Error(
                    "Active classroom not found for the given universityId"
                );
            }
        } else {
            throw new Error(
                "Department data not found for the given universityId"
            );
        }
    } catch (error) {
        console.error("Error retrieving active classroom data:", error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

const getCoursesData = async (userId, universityId) => {
    try {
        // Step 1: Retrieve the student data to get the academicYearId
        const studentData = await getStudentData(userId);
        const classroomData = await getClassroomData(universityId);
        const academicYearData = await getAcademicYearData(universityId);

        // Step 2: Query the courses collection to find courses for the given universityId and academicYearId
        const coursesCollection = admin.firestore().collection("courses");
        const coursesSnapshot = await coursesCollection
            .where("classroomId", "==", classroomData.id)
            .get();

        const combinedData = [];

        // Iterate through courses
        for (const courseDoc of coursesSnapshot.docs) {
            const courseData = courseDoc.data();

            // Step 3: Query the cotations collection to find cotation data for the given courseId, studentId, and academicYearId
            const cotationsCollection = admin
                .firestore()
                .collection("cotations");
            const cotationSnapshot = await cotationsCollection
                .where("courseId", "==", courseDoc.id)
                .where("studentId", "==", studentData.studentId)
                .where("academicYearId", "==", academicYearData.id)
                .get();

            // If cotation data is found, combine it with course data
            if (!cotationSnapshot.empty) {
                const cotationData = cotationSnapshot.docs[0].data();

                combinedData.push({
                    courseName: courseData.name,
                    coursePonderation: courseData.ponderation,
                    studentRating: cotationData.rating,
                    total: cotationData.total,
                });
            }
        }

        return combinedData;
    } catch (error) {
        console.error("Error retrieving combined course data:", error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

// create a document
exports.createDocument = async (req, res, next) => {
    try {
        const { name, documentType, userId, universityId } = req.body;
        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const currentDateTime = new Date();

        const documentRef = admin.firestore().collection("documents").doc();

        let document;

        if (documentType === "Image") {
            // Logic for 'Image' document type
            document = {
                name,
                status: "active",
                userId,
                universityId,
                documentType,
                image: [],
                createdAt: currentDateTime,
                updatedAt: currentDateTime,
            };

            // Upload images to Firebase Storage
            const promises = [];

            for (const file of req.files) {
                const fileName = file.originalname;
                const fileUpload = bucket.file(`documents/${uuid}-${fileName}`);
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
                                document.image.push(imageUrl);
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
        } else if (documentType === "Releve de cotes") {
            // Logic for 'Releve de cotes' document type
            // Retrieve necessary data from other collections (faculty, academicYear, university, user, classroom, courses)
            // Use the retrieved data to structure the 'releve' field
            // ...

            document = {
                name,
                status: "active",
                userId,
                universityId,
                documentType,
                releve: {
                    id: uuidv4(),
                    student: await getStudentData(userId),
                    university: await getUniversityData(universityId),
                    academicYear: await getAcademicYearData(universityId),
                    faculty: await getFacultyData(universityId),
                    classroom: await getClassroomData(universityId),
                    courses: await getCoursesData(),
                },
                createdAt: currentDateTime,
                updatedAt: currentDateTime,
            };
        } else {
            // Handle invalid documentType
            return res.status(400).send({
                message:
                    "Invalid documentType. Allowed values are 'Image' or 'Releve de cotes'.",
            });
        }

        // Save document to Firestore
        await documentRef.set(document);

        res.send({
            message: "Document créée avec succès",
            document: {
                id: documentRef.id,
                name,
                status: document.status,
                userId,
                documentType,
                image: document.image || undefined,
                releve: document.releve || undefined,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating document:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de ce document",
            error: error.message,
        });
    }
};

// get a list of documents
exports.getDocuments = async (req, res) => {
    try {
        // Retrieve the list of registered documents from Cloud Firestore
        const documentsRef = admin.firestore().collection("documents");
        const documentsSnapshot = await documentsRef.get();
        const documents = [];

        // Loop through each document and add it to the categories array
        for (const doc of documentsSnapshot.docs) {
            const userRef = await admin
                .firestore()
                .collection("users")
                .doc(doc.data().userId)
                .get();
            const universityRef = await admin
                .firestore()
                .collection("universities")
                .doc(doc.data().universityId)
                .get();

            documents.push({
                id: doc.id,
                user: {
                    id: doc.data().userId,
                    ...userRef.data(),
                },
                university: {
                    id: doc.data().universityId,
                    ...universityRef.data(),
                },
                ...doc.data(),
            });
        }

        // Paginate the list of documents
        const paginatedDocuments = paginate(
            documents,
            req.query.page,
            req.query.limit
        );

        // Send the paginated list of documents as a JSON response
        res.json(paginatedDocuments);
    } catch (error) {
        console.error("Error retrieving documents:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la récupération de la liste des documents",
            error: error.message,
        });
    }
};

// getting a specific document informations
exports.getDocument = async (req, res, next) => {
    try {
        // Retrieve the document data from Cloud Firestore
        const documentsRef = admin.firestore().collection("documents");
        const documentDoc = await documentsRef.doc(req.params.id).get();
        const documentData = documentDoc.data();

        if (!documentDoc.exists) {
            return res.status(404).send({
                message: "Ce document n'a pas été trouvé",
            });
        }

        const userRef = await admin
            .firestore()
            .collection("users")
            .doc(documentDoc.data().userId)
            .get();
        const universityRef = await admin
            .firestore()
            .collection("universities")
            .doc(documentDoc.data().universityId)
            .get();

        // Combine the document record and document data into a single object
        const document = {
            id: documentDoc.id,
            user: {
                id: documentDoc.data().userId,
                ...userRef.data(),
            },
            university: {
                id: documentDoc.data().universityId,
                ...userRef.data(),
            },
            ...documentData,
        };

        // Send the document object as a JSON response
        res.json(document);
    } catch (error) {
        console.error("Error retrieving document infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de ce document`,
            error: error.message,
        });
    }
};

exports.deactivateDocument = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const documentsRef = admin.firestore().collection("documents");
        const documentDoc = await documentsRef.doc(id).get();

        // Check if the document exists
        if (!documentDoc.exists) {
            res.status(404).send(
                `Aucun document trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== userDoc.data().uid) {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the document
        await documentsRef
            .doc(id)
            .update({ status: "inactive", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Document désactivé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la désactivation du document",
            error: error.message,
        });
    }
};

exports.activateDocument = async (req, res, next) => {
    const currentDateTime = new Date();

    try {
        const id = req.params.id;
        const documentsRef = admin.firestore().collection("documents");
        const documentDoc = await documentsRef.doc(id).get();

        // Check if the document exists
        if (!documentDoc.exists) {
            res.status(404).send(
                `Aucun document trouvé avec cet identifiant`
            );
            return;
        }

        // check permissions for this action
        // if (req.user.uid !== userDoc.data().uid && req.user.role !== "admin") {
        //     res.status(403).send({
        //         message: `Action non autorisée pour cet utilisateur`,
        //     });
        //     return;
        // }

        // Deactivate the document
        await documentsRef
            .doc(id)
            .update({ status: "active", updatedAt: currentDateTime });

        res.status(200).send({
            message: "Document activé avec succès",
            author: "Owner",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de l'activation du document",
            error: error.message,
        });
    }
};
