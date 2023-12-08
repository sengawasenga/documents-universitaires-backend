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
