const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create an university
exports.createUniversity = async (req, res, next) => {
    try {
        const { name, address, description } = req.body;
        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        // const userId = req.user.uid;
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
            // userId,
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
                // userId,
                logo: university.logo,
                createdAt: university.createdAt,
                updatedAt: university.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error creating university:", error);
        res.status(500).send({
            message:
                "Une erreur est survenue lors de la création de cette publication",
            error: error.message,
        });
    }
};

// update a specific university
exports.updateUniversity = async (req, res, next) => {
    try {
        const { name, address, description } = req.body;
        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        const currentDateTime = new Date();

        const universityRef = admin.firestore().collection("universities");
        const universityDoc = await universityRef.doc(req.params.id).get();

        // Check if the user has permission to update a post
        // if (req.user.uid !== postDoc.data().userId && req.user.role !== 'admin') {
        //     res.status(403).send({ message: `Cette action n'est pas autorisée pour cet utilisateur` });
        //     return;
        // }

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
            // userId,
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
            message: "Publication mise à jour avec succès!",
            uid: req.params.uid,
            // author: req.user.role == "admin" ? "Admin" : "Owner",
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
        universitiesSnapshot.forEach((doc) => {
            universities.push({
                id: doc.id,
                name: doc.data().name,
                description: doc.data().description,
                status: doc.data().status,
                address: doc.data().address,
                logo: doc.data().logo,
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            });
        });

        // Paginate the list of universities
        const paginatedUniversities = paginate(universities, req.query.page, req.query.limit);

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
exports.getUniversity = async (req, res, next) => {
    try {

        // Retrieve the university data from Cloud Firestore
        const universitiesRef = admin.firestore().collection("universities");
        const universityDoc = await universitiesRef.doc(req.params.uid).get();
        const universityData = universityDoc.data();

        if (!universityDoc.exists) {
            return res.status(404).send({
                message: "Cet utilisateur n'a pas été trouvé",
            });
        }

        // Combine the university record and university data into a single object
        const university = {
            id: universityRecord.uid,
            name: universityData.name,
            description: universityData.description,
            address: universityData.address,
            logo: universityData.logo,
            status: universityData.status,
            createdAt: universityData.createdAt,
            updatedAt: universityData.updatedAt,
        };

        // Send the university object as a JSON response
        res.json(university);
    } catch (error) {
        console.error("Error retrieving university infos:", error);
        res.status(500).send({
            message: `Une erreur est survenue lors de la récupération de cet utilisateur`,
            error: error.message,
        });
    }
};
