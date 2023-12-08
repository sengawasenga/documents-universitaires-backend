const express = require("express");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const universitiesRouter = require("./routes/universities");

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
app.use("/universities", universitiesRouter);

module.exports = app;
