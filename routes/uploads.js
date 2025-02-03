const { commonCtrl } = require("../controllers/CommonController");
const uploadRouter = require("express").Router();

uploadRouter.post('/single', commonCtrl.uploadSingleFile)
uploadRouter.post('/multiple', commonCtrl.uploadMultipleFile)

module.exports = { uploadRouter }