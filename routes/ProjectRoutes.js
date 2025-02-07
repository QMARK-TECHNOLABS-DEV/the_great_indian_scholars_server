const router = require("express").Router();
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const projectCtrl = require("../controllers/ProjectController");
const staffChecker = require("../middlewares/staffChecker");
const { permissionGuard } = require("../middlewares/permissionGuard");

router.post("/create", adminCheckMiddleware, projectCtrl.CreateProject)
router.get("/get-all", staffChecker, permissionGuard(["view_project"]), projectCtrl.GetAllProjects)
router.get("/get-all-of-emp/:id", staffChecker, permissionGuard(["view_project"]), projectCtrl.GetEmpProjects)
router.get("/get/:id", staffChecker, permissionGuard(["view_project"]), projectCtrl.GetProject)
router.get("/get-task/:id", staffChecker, permissionGuard(["view_project"]), projectCtrl.GetATaskOfAProject)
router.put("/change-task-status", staffChecker, permissionGuard(["edit_project"]), projectCtrl.ChangeTaskStatus)
router.delete("/delete/:id", adminCheckMiddleware, projectCtrl.DeleteProject)

router.post("/add-task", adminCheckMiddleware, projectCtrl.AddTask)
router.get("/get-all-tasks/:id", staffChecker, permissionGuard(["view_project"]), projectCtrl.GetAllTasksOfAProject)
router.delete("/delete-task/:id", adminCheckMiddleware, projectCtrl.DeleteATask)
router.put("/update-task/:id", staffChecker, permissionGuard(["edit_project"]), projectCtrl.UpdateTask)

router.put("/update", adminCheckMiddleware, projectCtrl.UpdateProject)

router.put("/rework-task/:id", adminCheckMiddleware, projectCtrl.ReworkTask)


router.get("/get-members/:id", staffChecker, permissionGuard(["view_project"]), projectCtrl.GetMembers)

module.exports = router;