const express = require('express');
const app = express();
require("dotenv").config();
const ConnectDB = require("./db");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const path = require("path")
const authRouter = require("./routes/AuthRoutes");
const adminRouter = require("./routes/AdminRoutes");
const employeeRouter = require("./routes/EmployeeRoutes");
const studentRouter = require("./routes/StudentRoutes");
const applicationRouter = require("./routes/ApplicationRoutes");
const commentRouter = require("./routes/CommentRoutes");
const projectRouter = require("./routes/ProjectRoutes");
const stepperRouter = require("./routes/StepperRoutes");
const leadRouter = require("./routes/LeadRoutes");
const dataRouter = require("./routes/DataRoutes");
const authMiddleware = require('./middlewares/authMiddleware');

const PORT = process.env.PORT || 8800;

ConnectDB();

const ClientURL = process.env.ClientURL;

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);

    } else {
      const allowedOrigins = [ClientURL];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    }
  }
};

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/images", express.static(path.join(__dirname, "/public/images")))

app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);

app.use(authMiddleware);

app.use("/api/admin", adminRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/student", studentRouter);
app.use("/api/application", applicationRouter);
app.use("/api/comment", commentRouter);
app.use("/api/project", projectRouter);
app.use("/api/stepper", stepperRouter)
app.use("/api/lead", leadRouter)

app.use("*", (req, res) => {
    res.sendStatus(404);
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))