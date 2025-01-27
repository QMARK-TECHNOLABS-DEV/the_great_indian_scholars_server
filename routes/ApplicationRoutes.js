const express = require("express");
const router = express.Router();
const applicationCtrl = require("../controllers/ApplicationController");
const {upload} = require("../middlewares/multerToS3");
const staffChecker = require("../middlewares/staffChecker");

router.post("/create",  staffChecker, applicationCtrl.CreateApplication);
router.get("/get-all",  staffChecker, applicationCtrl.GetAllApplications);
router.get("/get-emps/:id",  staffChecker, applicationCtrl.GetMyApplications);
router.get("/get-team/:id",  staffChecker, applicationCtrl.GetTeamApplications);
router.get("/get/:id",  applicationCtrl.GetApplication);
router.put("/update/:id",  staffChecker, applicationCtrl.UpdateApplication);
router.delete("/delete/:id",  staffChecker, applicationCtrl.DeleteApplication);

router.post("/upload-document/:id/:name",  applicationCtrl.CheckDocName, upload.single('document'), applicationCtrl.UploadDoc)
router.get("/get-document/:id/:name",  applicationCtrl.GetDocument);
router.put("/delete-document/:id/:name",  applicationCtrl.DeleteDocument);
router.put("/update-document/:id/:name",  upload.single('document'), applicationCtrl.UpdateDocument);

router.put("/phase-change/:id",  staffChecker, applicationCtrl.PhaseChange);

module.exports = router;