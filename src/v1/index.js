const express = require("express");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const universitiesRouter = require("./routes/universities");
const facultiesRouter = require("./routes/faculties");
const departmentsRouter = require("./routes/departments");
const classroomsRouter = require("./routes/classrooms");
const academicYearsRouter = require("./routes/academicYears");
const professorsRouter = require("./routes/professors");
const studentsRouter = require("./routes/students");
const coursesRouter = require("./routes/courses");
const cotationsRouter = require("./routes/cotations");
const documentsRouter = require("./routes/documents");

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
app.use("/faculties", facultiesRouter);
app.use("/departments", departmentsRouter);
app.use("/classrooms", classroomsRouter);
app.use("/academicYears", academicYearsRouter);
app.use("/professors", professorsRouter);
app.use("/students", studentsRouter);
app.use("/courses", coursesRouter);
app.use("/cotations", cotationsRouter);
app.use("/documents", documentsRouter);

module.exports = app;
