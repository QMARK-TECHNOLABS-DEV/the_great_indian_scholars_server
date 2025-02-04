const express = require("express");
const router = express.Router();
const leadCtrl = require("../controllers/LeadController");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const staffChecker = require("../middlewares/staffChecker");
const multer = require('multer');
const {customRoleChecker} = require("../middlewares/customRoleChecker");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/create", staffChecker, leadCtrl.CreateLead)
router.post("/create-bulk", staffChecker, upload.single('excelFile'), leadCtrl.BulkLeadCreation)
router.put("/update", staffChecker, leadCtrl.UpdateLead)
router.put("/bulk-assign", customRoleChecker(['admin', 'leader']), leadCtrl.BulkAssign)
router.get("/get/:id", staffChecker, leadCtrl.GetALead)

router.get("/assigned-leads/:id", staffChecker, leadCtrl.GetMyLeads)
router.get("/team-leads/:id", staffChecker, leadCtrl.GetLeadsofTeamMembers)
router.get("/get-all", staffChecker, leadCtrl.GetAllLeads)

router.delete("/delete/:id", staffChecker, leadCtrl.DeleteALead)

router.post("/followup/create", staffChecker, leadCtrl.createFollowup)
router.put("/followup/update/:id", staffChecker, leadCtrl.updateFollowup)
router.get("/followup/get/:id", staffChecker, leadCtrl.getAFollowup)
router.get("/followup/of-lead/:id", staffChecker, leadCtrl.getFollowupsOfALead)

router.get("/followup/emp/:id", staffChecker, leadCtrl.getEmpsFollowups)
router.get("/followup/get-all", staffChecker, leadCtrl.getAllFollowups)
router.get("/followup/get-team/:id", staffChecker, leadCtrl.getTeamFollowups)


module.exports = router;

