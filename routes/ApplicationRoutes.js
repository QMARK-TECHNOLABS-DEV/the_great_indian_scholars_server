const express = require("express");
const router = express.Router();
const applicationCtrl = require("../controllers/ApplicationController");
const {upload} = require("../middlewares/multerToS3");
const staffChecker = require("../middlewares/staffChecker");
const { permissionGuard } = require("../middlewares/permissionGuard");

router.post("/create",  staffChecker, permissionGuard(["create_application"]), applicationCtrl.CreateApplication);
router.get("/get-all",  staffChecker, permissionGuard(["view_application"]), applicationCtrl.GetAllApplications);
router.get("/get-emps/:id",  staffChecker, permissionGuard(["view_application"]), applicationCtrl.GetMyApplications);
router.get("/get-team/:id",  staffChecker, permissionGuard(["view_application"]), applicationCtrl.GetTeamApplications);
router.get("/get/:id",  applicationCtrl.GetApplication);
router.put("/update/:id",  staffChecker, permissionGuard(["edit_application"]), applicationCtrl.UpdateApplication);
router.delete("/delete/:id",  staffChecker, permissionGuard(["delete_application"]), applicationCtrl.DeleteApplication);

router.post("/upload-document/:id/:name",  applicationCtrl.CheckDocName, upload.single('document'), applicationCtrl.UploadDoc)
router.get("/get-document/:id/:name",  applicationCtrl.GetDocument);
router.put("/delete-document/:id/:name",  applicationCtrl.DeleteDocument);
router.put("/update-document/:id/:name",  upload.single('document'), applicationCtrl.UpdateDocument);

router.put("/phase-change/:id",  staffChecker, applicationCtrl.PhaseChange);

module.exports = router;