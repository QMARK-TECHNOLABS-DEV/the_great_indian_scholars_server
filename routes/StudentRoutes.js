const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/StudentController");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const {upload} = require("../middlewares/multerToS3");
const staffChecker = require("../middlewares/staffChecker");

router.post("/create",  staffChecker, upload.single('image'), studentCtrl.CreateStudent);
router.get("/get-all",  staffChecker, studentCtrl.GetAllStudents )
router.get("/get/:id",  studentCtrl.GetStudent);
router.put("/update/:id",  staffChecker, upload.single('image'), studentCtrl.UpdateStudent)
router.put("/change-password",  studentCtrl.ChangePassword);

router.get("/get-application/:id",  studentCtrl.GetMyApplication)

router.get("/get-my-applications/:id",  studentCtrl.GetAllOfMyApplications)

router.put("/deactivate/:id",  staffChecker, studentCtrl.DeactivateStudent)

router.get("/get-work-students/:id",  staffChecker, studentCtrl.GetWorkStudents )

router.get("/get-team-students/:id",  staffChecker, studentCtrl.GetTeamStudents )



module.exports = router;