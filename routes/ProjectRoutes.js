const router = require("express").Router();
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const projectCtrl = require("../controllers/ProjectController");
const staffChecker = require("../middlewares/staffChecker");

router.post("/create",adminCheckMiddleware, projectCtrl.CreateProject)
router.get("/get-all",staffChecker, projectCtrl.GetAllProjects)
router.get("/get-all-of-emp/:id",staffChecker, projectCtrl.GetEmpProjects)
router.get("/get/:id", staffChecker, projectCtrl.GetProject)
router.get("/get-task/:id", staffChecker, projectCtrl.GetATaskOfAProject)
router.put("/change-task-status", staffChecker, projectCtrl.ChangeTaskStatus)
router.delete("/delete/:id",adminCheckMiddleware, projectCtrl.DeleteProject)

router.post("/add-task", adminCheckMiddleware, projectCtrl.AddTask)
router.get("/get-all-tasks/:id", staffChecker, projectCtrl.GetAllTasksOfAProject)
router.delete("/delete-task/:id", adminCheckMiddleware, projectCtrl.DeleteATask)
router.put("/update-task/:id", staffChecker, projectCtrl.UpdateTask)

router.put("/update",  adminCheckMiddleware, projectCtrl.UpdateProject)

router.put("/rework-task/:id",  adminCheckMiddleware, projectCtrl.ReworkTask)


router.get("/get-members/:id",  staffChecker, projectCtrl.GetMembers)

module.exports = router;