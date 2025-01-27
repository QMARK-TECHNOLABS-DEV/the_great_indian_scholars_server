const express = require("express");
const router = express.Router();
const commentCtrl = require("../controllers/CommentController");
const staffChecker = require("../middlewares/staffChecker");

router.get("/get-all/:type/:id",  staffChecker, commentCtrl.GetComments)
router.post("/add",  staffChecker, commentCtrl.AddComment)


module.exports = router;