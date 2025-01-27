const express = require("express");
const router = express.Router();
const employeeCtrl = require("../controllers/EmployeeController");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const {upload} = require("../middlewares/multerToS3");
const staffChecker = require("../middlewares/staffChecker");

router.post("/create",  adminCheckMiddleware, upload.single('image'), employeeCtrl.CreateEmployee);
router.get("/get-all",  staffChecker, employeeCtrl.GetAllEmployees )
router.get("/get-workers",  staffChecker, employeeCtrl.GetAllWorkers )
router.get("/get-team-members/:id",  staffChecker, employeeCtrl.GetTeamMembers )
router.get("/get-all-leaders",  adminCheckMiddleware, employeeCtrl.GetAllLeaders )
router.get("/get/:id",  employeeCtrl.GetEmployee);
router.put("/update/:id",  adminCheckMiddleware, upload.single('image'), employeeCtrl.UpdateEmployee)
router.put("/change-password", staffChecker, employeeCtrl.ChangePassword);
router.put("/deactivate/:id",  adminCheckMiddleware, employeeCtrl.DeactivateEmployee)

router.get("/get-assigned-works/:id",  staffChecker, employeeCtrl.RetrieveWorks)
router.get("/get-team-works/:id",  staffChecker, employeeCtrl.RetrieveTeamWorks)

router.get("/get-task-metrics/:id",  staffChecker, employeeCtrl.GetEmployeeTaskMetrics)
router.get("/get-team-task-metrics/:id",  staffChecker, employeeCtrl.GetTeamTaskMetrics)

router.get("/get-lead-metrics/:id",  staffChecker, employeeCtrl.GetEmployeeLeadMetrics)
router.get("/get-team-lead-metrics/:id",  staffChecker, employeeCtrl.GetTeamLeadMetrics)

router.get("/get-followup-metrics/:id",  staffChecker, employeeCtrl.GetEmployeeFollowMetrics)
router.get("/get-team-followup-metrics/:id",  staffChecker, employeeCtrl.GetTeamFollowMetrics)

router.get("/get-assigned-projects/:id",  staffChecker, employeeCtrl.GetMyProjectTasks)

router.put("/assign-work",  staffChecker, employeeCtrl.WorkAssign)



module.exports = router;