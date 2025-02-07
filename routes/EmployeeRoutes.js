const express = require("express");
const router = express.Router();
const employeeCtrl = require("../controllers/EmployeeController");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const {upload} = require("../middlewares/multerToS3");
const staffChecker = require("../middlewares/staffChecker");
const { permissionGuard } = require("../middlewares/permissionGuard");

router.post("/create",  adminCheckMiddleware, upload.single('image'), employeeCtrl.CreateEmployee);
router.get("/get-all",  staffChecker, permissionGuard(["view_employee"]), employeeCtrl.GetAllEmployees )
router.get("/get-workers",  staffChecker, permissionGuard(["view_employee"]), employeeCtrl.GetAllWorkers )
router.get("/get-team-members/:id",  staffChecker, permissionGuard(["view_employee"]), employeeCtrl.GetTeamMembers )
router.get("/get-all-leaders",  adminCheckMiddleware, employeeCtrl.GetAllLeaders )
router.get("/get/:id",  employeeCtrl.GetEmployee);
router.put("/update/:id",  adminCheckMiddleware, upload.single('image'), employeeCtrl.UpdateEmployee)
router.put("/change-password", staffChecker, permissionGuard(["edit_employee"]), employeeCtrl.ChangePassword);
router.put("/deactivate/:id",  adminCheckMiddleware, employeeCtrl.DeactivateEmployee)

router.get("/get-assigned-works/:id",  staffChecker, permissionGuard(["view_application"]), employeeCtrl.RetrieveWorks)
router.get("/get-team-works/:id",  staffChecker, permissionGuard(["view_application"]), employeeCtrl.RetrieveTeamWorks)

router.get("/get-task-metrics/:id",  staffChecker, permissionGuard(["view_application"]), employeeCtrl.GetEmployeeTaskMetrics)
router.get("/get-team-task-metrics/:id",  staffChecker, permissionGuard(["view_application"]), employeeCtrl.GetTeamTaskMetrics)

router.get("/get-lead-metrics/:id",  staffChecker, permissionGuard(["view_lead"]), employeeCtrl.GetEmployeeLeadMetrics)
router.get("/get-team-lead-metrics/:id",  staffChecker, permissionGuard(["view_lead"]), employeeCtrl.GetTeamLeadMetrics)

router.get("/get-followup-metrics/:id",  staffChecker, permissionGuard(["view_followup"]), employeeCtrl.GetEmployeeFollowMetrics)
router.get("/get-team-followup-metrics/:id",  staffChecker, permissionGuard(["view_followup"]), employeeCtrl.GetTeamFollowMetrics)

router.get("/get-assigned-projects/:id",  staffChecker, permissionGuard(["view_project"]), employeeCtrl.GetMyProjectTasks)

router.put("/assign-work",  staffChecker, permissionGuard(["assign_application"]), employeeCtrl.WorkAssign)



module.exports = router;