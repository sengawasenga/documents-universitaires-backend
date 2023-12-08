const express = require("express");
const authRouter = require("./routes/auth");

const app = express();

app.get("/", (req, res) => {
    res.send({
        message:
            "Bienvenue à la première version de l'application back-end de documents universitaires :)",
    });
});

// Mount different routers at their respective base URLs
app.use("/auth", authRouter);

module.exports = app;
