const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/AdminController");
const adminCheckMiddleware = require("../middlewares/adminCheckMiddleware");
const { customRoleChecker } = require("../middlewares/customRoleChecker");

router.use(adminCheckMiddleware)

router.get("/get/:id", adminCtrl.GetAdmin);
router.put("/update", adminCtrl.UpdateAdmin);
router.put("/change-password", adminCtrl.ChangePassword);

// dashboard endpoints
router.get("/team-lead-statistics", customRoleChecker(["super admin"]), adminCtrl.getTeamLeaderStatistics)
router.get("/get-application-metrics", adminCtrl.GetApplicationMetrics);
router.get('/get-emps-appsnleads', adminCtrl.GetEmpBasedLeadsnApps)
router.get('/get-appsnleads', adminCtrl.AllLeadsnApps)
router.get('/get-leadstages', adminCtrl.LeadStages)

router.post('/office', adminCtrl.createOffice)
router.put('/office/:id', adminCtrl.updateOffice)
router.delete('/office/:id', adminCtrl.deleteOffice)

module.exports = router;