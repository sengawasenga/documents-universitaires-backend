require("dotenv").config();
const express = require("express");
const v1Router = require("./v1");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
    handleNotFound,
    handleMethodNotAllowed,
    handleServerError,
} = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send({
        message: "Bienvenue à l'application back-end de documents universitaires :)",
    });
});

// Mount the different versions routers at their respective base URLs
app.use("/api/v1", v1Router);

// Use the errorHandler middleware for all requests
app.use(handleNotFound);
app.use(handleMethodNotAllowed);
app.use(handleServerError);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Export the Express API
module.exports = app;
