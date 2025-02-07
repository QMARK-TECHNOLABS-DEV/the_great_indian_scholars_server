const { deptCtrl } = require("../controllers/DepartmentController");
const { customRoleChecker } = require("../middlewares/customRoleChecker");

const departmentRouter = require("express").Router();

departmentRouter.get('', deptCtrl.getAllDepartments)
departmentRouter.get('/:id', deptCtrl.getDepartment)

departmentRouter.put('/:id', customRoleChecker(["super admin", "admin"]), deptCtrl.updateDepartment)

departmentRouter.use(customRoleChecker(["super admin", "admin"]))
departmentRouter.post('', deptCtrl.createDepartment)
departmentRouter.patch('/:id', deptCtrl.deactivateDepartment)

module.exports = { departmentRouter };