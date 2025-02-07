const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/StudentController");
const { upload } = require("../middlewares/multerToS3");
const staffChecker = require("../middlewares/staffChecker");
const { permissionGuard } = require("../middlewares/permissionGuard");

router.post("/create", staffChecker, permissionGuard(["create_student"]), upload.single('image'), studentCtrl.CreateStudent);
router.get("/get-all", staffChecker, permissionGuard(["view_student"]), studentCtrl.GetAllStudents)
router.get("/get/:id", studentCtrl.GetStudent);
router.put("/update/:id", staffChecker, permissionGuard(["edit_student"]), upload.single('image'), studentCtrl.UpdateStudent)
router.put("/change-password", studentCtrl.ChangePassword);

router.get("/get-application/:id", studentCtrl.GetMyApplication)

router.get("/get-my-applications/:id", studentCtrl.GetAllOfMyApplications)

router.put("/deactivate/:id", staffChecker, permissionGuard(["delete_student"]), studentCtrl.DeactivateStudent)

router.get("/get-work-students/:id", staffChecker, permissionGuard(["view_student"]), studentCtrl.GetWorkStudents)

router.get("/get-team-students/:id", staffChecker, permissionGuard(["view_student"]), studentCtrl.GetTeamStudents)



module.exports = router;