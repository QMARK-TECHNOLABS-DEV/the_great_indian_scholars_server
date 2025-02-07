const router = require("express").Router();
const staffChecker = require("../middlewares/staffChecker");
const stepCtrl = require("../controllers/StepperController");
const { permissionGuard } = require("../middlewares/permissionGuard");

router.post("/create",  staffChecker, permissionGuard(["create_application"]), stepCtrl.CreateMultipleSteppers)
router.get("/get/:id",  staffChecker, permissionGuard(["view_application"]), stepCtrl.GetSingleStepper)
router.get("/get-all/:id",  staffChecker, permissionGuard(["view_application"]), stepCtrl.GetAllSteppers)
router.put("/update",  staffChecker, permissionGuard(["edit_application"]), stepCtrl.updateStepper)
router.delete("/delete/:id",  staffChecker, permissionGuard(["delete_application"]), stepCtrl.DeleteAStepper)

module.exports = router;