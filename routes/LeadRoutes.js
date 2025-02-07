const express = require("express");
const router = express.Router();
const leadCtrl = require("../controllers/LeadController");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const staffChecker = require("../middlewares/staffChecker");
const multer = require('multer');
const {customRoleChecker} = require("../middlewares/customRoleChecker");
const { permissionGuard } = require("../middlewares/permissionGuard");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/create", staffChecker, permissionGuard(["create_lead"]), leadCtrl.CreateLead)
router.post("/create-bulk", staffChecker, permissionGuard(["create_lead"]), upload.single('excelFile'), leadCtrl.BulkLeadCreation)
router.put("/update", staffChecker, permissionGuard(["edit_lead"]), leadCtrl.UpdateLead)
router.put("/bulk-assign", customRoleChecker(['admin', 'leader']), permissionGuard(["assign_lead"]), leadCtrl.BulkAssign)
router.get("/get/:id", staffChecker, permissionGuard(["view_lead"]), leadCtrl.GetALead)

router.get("/assigned-leads/:id", staffChecker, permissionGuard(["view_lead"]), leadCtrl.GetMyLeads)
router.get("/team-leads/:id", staffChecker, permissionGuard(["view_lead"]), leadCtrl.GetLeadsofTeamMembers)
router.get("/get-all", staffChecker, permissionGuard(["view_lead"]), leadCtrl.GetAllLeads)

router.delete("/delete/:id", staffChecker, permissionGuard(["delete_lead"]), leadCtrl.DeleteALead)

router.post("/followup/create", staffChecker, permissionGuard(["create_followup"]), leadCtrl.createFollowup)
router.put("/followup/update/:id", staffChecker, permissionGuard(["edit_followup"]), leadCtrl.updateFollowup)
router.get("/followup/get/:id", staffChecker, permissionGuard(["view_followup"]), leadCtrl.getAFollowup)
router.get("/followup/of-lead/:id", staffChecker, permissionGuard(["view_followup"]), leadCtrl.getFollowupsOfALead)

router.get("/followup/emp/:id", staffChecker, permissionGuard(["view_followup"]), leadCtrl.getEmpsFollowups)
router.get("/followup/get-all", staffChecker, permissionGuard(["view_followup"]), leadCtrl.getAllFollowups)
router.get("/followup/get-team/:id", staffChecker, permissionGuard(["view_followup"]), leadCtrl.getTeamFollowups)


module.exports = router;

