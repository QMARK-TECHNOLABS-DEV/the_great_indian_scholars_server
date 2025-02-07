const Department = require("../models/DepartmentModel");
const Employee = require("../models/EmployeeModel");

const permissionGuard = (permissions = []) => {
    return async (req, res, next) => {
        const role = req.user.role;

        if (["super admin", "admin"]?.includes(role)) {
            return next()
        }

        const userId = req.user.userId;

        const user = await Employee.findById(userId).lean();

        const department = user.department;

        const deptDoc = await Department.findOne({ name: department }).lean();

        const userPermissions = deptDoc?.permissions;

        if (permissions.every(elem => userPermissions?.includes(elem))) {
            return next()
        }
        else {
            return res.status(403).json({ msg: 'Insufficient Permissions' })
        }
    }

}

module.exports = { permissionGuard }