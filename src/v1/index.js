const express = require("express");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");

const app = express();

app.get("/", (req, res) => {
    res.send({
        message:
            "Bienvenue à la première version de l'application back-end de documents universitaires :)",
    });
});

// Mount different routers at their respective base URLs
app.use("/auth", authRouter);
app.use("/users", usersRouter);

module.exports = app;
