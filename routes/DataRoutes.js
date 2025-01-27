const router = require("express").Router();
const dataCtrl = require("../controllers/DataController")

router.post("/add", dataCtrl.addData)

router.get("/get", dataCtrl.getData)

router.get('/office/:id', dataCtrl.getOffice)
router.get('/office', dataCtrl.getAllOffices)

module.exports = router;