const router = require("express").Router();
const staffChecker = require("../middlewares/staffChecker");
const stepCtrl = require("../controllers/StepperController");

router.post("/create",  staffChecker, stepCtrl.CreateMultipleSteppers)
router.get("/get/:id",  staffChecker, stepCtrl.GetSingleStepper)
router.get("/get-all/:id",  staffChecker, stepCtrl.GetAllSteppers)
router.put("/update",  staffChecker, stepCtrl.updateStepper)
router.delete("/delete/:id",  staffChecker, stepCtrl.DeleteAStepper)

module.exports = router;