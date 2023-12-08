const admin = require("../../firebase/db");
const { v4: uuidv4 } = require("uuid");
const paginate = require("../../utils/paginate");

// create an university
exports.createUniversity = async (req, res, next) => {
    try {
        const { name, address, description } =
            req.body;
        const bucket = admin.storage().bucket();
        const uuid = uuidv4();
        // const userId = req.user.uid;
        const currentDateTime = new Date();

        const universityRef = admin.firestore().collection("universities").doc();
        const university = {
            name,
            address,
            description,
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

        // Send the updated user data as a JSON response
        res.json({
            message: "Publication mise à jour avec succès!",
            uid: req.params.uid,
            // author: req.user.role == "admin" ? "Admin" : "Owner",
        });
    } catch (error) {
        console.error("Error updating university:", error);
        res.status(500).send({
            message: "Une erreur est survenue lors de la mise à jour de cette universite",
            error: error.message,
        });
    }
};
