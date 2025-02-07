const { isValidObjectId } = require("mongoose");
const Department = require("../models/DepartmentModel");

const deptCtrl = {}

deptCtrl.createDepartment = async (req, res) => {
    try {
        const { name, icon, permissions } = req.body;

        const existingName = await Department.findOne({ name });

        if (existingName) {
            return res.status(400).json({ msg: "Name already exists" })
        }

        const newDoc = await Department.create({
            name, icon, permissions
        })

        console.log({ newDoc })

        res.status(200).json({ department: newDoc, msg: 'New department added' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

deptCtrl.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) { return res.status(400).json({ msg: "Invalid Id" }); }

        const { name, icon, permissions } = req.body;

        const existingName = await Department.findOne({ name });

        if (existingName && existingName?._id?.toString() !== id) {
            return res.status(400).json({ msg: "Name already exists" })
        }

        const department = await Department.findByIdAndUpdate(id, {
            $set: { name, icon, permissions }
        }, { new: true })

        if (!department) return res.status(404).json({ msg: "department Not found" });
        console.log({ department })


        res.status(200).json({ department: department, msg: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

deptCtrl.deactivateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(id)) { return res.status(400).json({ msg: "Invalid Id" }); }

        if (!["archived", "unarchived"]?.includes(status)) {
            return res.status(400).json({ msg: 'Invalid Status' })
        }

        let isArchived;

        if (status === "archived") {
            isArchived = true
        }
        else {
            isArchived = false
        }

        const department = await Department.findByIdAndUpdate(id,
            {
                $set: { isArchived }
            },
            { new: true }
        )

        if (!department) {
            return res.status(404).json({ msg: "department Not found" });
        }

        res.status(200).json({ result: department, msg: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

deptCtrl.getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) { return res.status(400).json({ msg: "Invalid Id" }); }

        const department = await Department.findById(id)

        if (!department) {
            return res.status(404).json({ msg: 'Not found' })
        }

        console.log({ department })

        res.status(200).json({ department: department, msg: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

deptCtrl.getAllDepartments = async (req, res) => {
    try {
        const department = await Department.find()

        console.log({ department })

        res.status(200).json({ department: department?.reverse(), msg: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

module.exports = { deptCtrl }