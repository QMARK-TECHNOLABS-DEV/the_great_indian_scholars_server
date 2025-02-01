const Employee = require("../models/EmployeeModel")
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Application = require("../models/ApplicationModel");
const Work = require("../models/WorkModel");
const Lead = require("../models/LeadModel");
const Followup = require("../models/FollowupModel");
const Task = require("../models/TaskModel");
const Stepper = require("../models/StepperModel")
const ObjectId = mongoose.Types.ObjectId;
const { isValidObjectId } = require("mongoose");
const ISTDate = require("../middlewares/ISTDate");

const employeeCtrl = {};

//Create Employee;

employeeCtrl.CreateEmployee = async (req, res) => {

    const { name, email, password, phone, education,
        department, birthDate, address, office, leader } = req.body;

    console.log("req.body", req.body);
    // console.log("req.file", req.file);

    try {

        let image;
        if (req.file) {
            image = req.file.location
        }

        if (name) {
            const nameRegex = /^[A-Za-z ]{3,}$/;
            if (!nameRegex.test(name)) return res.status(400).json({ msg: "Invalid Name format" });

        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

            const alreadyExists = await Employee.findOne({ email }).lean();
            if (alreadyExists) {
                return res.status(400).json({ msg: "Employee already exists" })
            }
        }

        let createObj = {
            name, email, phone,
            education, department,
            birthDate,
            image, office
        }

        if (department === "operations") {
            createObj.role = "leader"
        }
        else {
            if (leader) {
                createObj.leader = new ObjectId(leader)
            }
        }

        if (address) { createObj.address = address }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        createObj.password = hashedPassword;

        const newDocument = new Employee(createObj);

        const savedDoc = await newDocument.save();
        console.log("Saved employee", savedDoc);

        res.status(200).json({ msg: "New employee created" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" })
    }
}

//Get All Employees;

employeeCtrl.GetAllEmployees = async (req, res) => {
    const department = req.query.department;
    const name = req.query.name;
    const email = req.query.email;
    const searchQuery = req.query.search;

    // Paginators
    const page = req.query.page;
    const entries = req.query.entries;

    try {
        const ORArray = [
            { name: { $regex: new RegExp(searchQuery, "i") } },
            { email: { $regex: new RegExp(searchQuery, "i") } },
            { department: { $regex: new RegExp(searchQuery, "i") } }
        ];


        let filters = {
            $or: [...ORArray],
            name: { $regex: new RegExp(name, "i") },
            email: { $regex: new RegExp(email, "i") },
            department: { $regex: new RegExp(department, "i") },
        }

        const allEmployees = await Employee.find({ isActive: true, ...filters }, { password: 0 });
        // console.log("allEmployeess", allEmployees);

        let result = allEmployees

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}

employeeCtrl.GetAllWorkers = async (req, res) => {
    const name = req.query.name;
    const email = req.query.email;
    const searchQuery = req.query.search;

    // Paginators
    const page = req.query.page;
    const entries = req.query.entries;

    try {
        const ORArray = [
            { name: { $regex: new RegExp(searchQuery, "i") } },
            { email: { $regex: new RegExp(searchQuery, "i") } },
        ];


        let filters = {
            $or: [...ORArray],
            isActive: true,
            department: { $ne: "operations" },
            name: { $regex: new RegExp(name, "i") },
            email: { $regex: new RegExp(email, "i") },
        }

        const allWorkers = await Employee.find({ ...filters }, { password: 0 });
        // console.log("allWorkerss", allWorkers);

        let result = allWorkers

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}

employeeCtrl.GetTeamMembers = async (req, res) => {
    const leaderId = req.params.id;
    const department = req.query.department;
    const searchQuery = req.query.search;

    // Paginators
    const page = req.query.page;
    const entries = req.query.entries;

    try {

        let filters = {
            $or: [
                { leader: new ObjectId(leaderId) },
                { _id: new ObjectId(leaderId) },
            ],
            name: { $regex: new RegExp(searchQuery, "i") },
            department: { $regex: new RegExp(department, "i") },
        }

        const allMembers = await Employee.find({ isActive: true, ...filters }, { password: 0 });
        console.log("allMemberss", allMembers);

        let result = allMembers;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result);

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}

employeeCtrl.GetAllLeaders = async (req, res) => {
    const department = "operations"
    const name = req.query.name;
    const email = req.query.email;
    const searchQuery = req.query.search;

    // Paginators
    const page = req.query.page;
    const entries = req.query.entries;

    try {
        const ORArray = [
            { name: { $regex: new RegExp(searchQuery, "i") } },
            { email: { $regex: new RegExp(searchQuery, "i") } },
            { department: { $regex: new RegExp(searchQuery, "i") } }
        ];


        let filters = {
            $or: [...ORArray],
            name: { $regex: new RegExp(name, "i") },
            email: { $regex: new RegExp(email, "i") },
            department: { $regex: new RegExp(department, "i") },
        }

        const allLeaders = await Employee.find({ isActive: true, ...filters }, { _id: 1, name: 1 });
        // console.log("allLeaderss", allLeaders);

        let result = allLeaders;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result);

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}


//Get an employee;

employeeCtrl.GetEmployee = async (req, res) => {
    const empId = req.params.id;

    try {
        if (!isValidObjectId(empId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(empId, { password: 0 })
            .populate('office', '_id name')
        console.log(employee);

        if (!employee) return res.status(404).json({ msg: "Employee not found" });

        res.status(200).json(employee);
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ msg: "Something went wrong" });
    }
}

//Update Employee

employeeCtrl.UpdateEmployee = async (req, res) => {
    console.log(req.body);
    const employeeId = req.params.id;
    const updates = req.body;

    try {
        if (!isValidObjectId(employeeId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee not found" })

        if (updates.name) {
            const nameRegex = /^[A-Za-z ]{3,}$/;
            if (!nameRegex.test(updates.name)) return res.status(400).json({ msg: "Invalid Name format" });
        }

        if (updates.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updates.email)) return res.status(400).json({ msg: "Invalid Email format" });
        }

        if (req.file) {
            updates.image = req.file.location
        }

        if (updates.password) {

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(updates.password, salt);

            updates.password = hashedPassword;
        }

        if (updates.department) {
            if (updates.department === "operations") {
                updates.role = "leader"
                updates.leader = null
            }
            else {
                updates.role = "employee"
                updates.leader = new ObjectId(updates.leader)
            }
        }

        console.log("updates", updates);

        const updatedDocument = await Employee.findByIdAndUpdate(employeeId, {
            $set: updates
        }, { new: true });

        console.log("updatedDoc", updatedDocument)

        res.status(200).json({ msg: "Employee Updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

//Change password; 

employeeCtrl.ChangePassword = async (req, res) => {
    const empId = req.body.employeeId;
    const password = req.body.password;

    try {
        if (!isValidObjectId(empId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(empId);
        if (!employee) return res.status(404).json({ msg: "Employee not found" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await Employee.findByIdAndUpdate(empId, {
            $set: { password: hashedPassword }
        })

        res.status(200).json({ msg: "Password Changed" })
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}


//Deacivate Employee;

employeeCtrl.DeactivateEmployee = async (req, res) => {
    const empId = req.params.id;

    try {
        if (!isValidObjectId(empId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(empId);
        if (!employee) return res.status(404).json({ msg: "Employee not found" });

        await Employee.findByIdAndUpdate(empId, {
            $set: { isActive: false }
        });

        res.status(200).json({ msg: "Employee deleted" })
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}


employeeCtrl.RetrieveWorks = async (req, res) => {
    const employeeId = req.params.id;

    try {
        if (!isValidObjectId(employeeId)) return res.status(400).json({ msg: "Invalid Employee Id" });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee Not Found" });


        const result = await Work.aggregate([
            {
                $match: { assignee: new ObjectId(employeeId), stepStatus: { $ne: "completed" } }
            },
            {
                $lookup: {
                    from: 'applications',
                    localField: 'applicationId',
                    foreignField: '_id',
                    as: 'applicationDetails'
                }
            },
            {
                $unwind: '$applicationDetails'
            },
            {
                $lookup: {
                    from: 'steppers',
                    localField: 'stepperId',
                    foreignField: '_id',
                    as: 'stepperDetails'
                }
            },
            {
                $unwind: '$stepperDetails'
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentDetails'
                }
            },
            {
                $unwind: '$studentDetails'
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'assignee',
                    foreignField: '_id',
                    as: 'employeeDetails'
                }
            },
            {
                $unwind: '$employeeDetails'
            },
            {
                $addFields: {
                    'studentName': '$studentDetails.name',
                    'assigneeName': '$employeeDetails.name',
                    'country': '$applicationDetails.country',
                    'university': '$stepperDetails.university',
                    'program': '$stepperDetails.program',
                    'intake': '$stepperDetails.intake',
                }
            },
            {
                $project: {
                    'studentName': 1,
                    'assigneeName': 1,
                    'applicationId': 1,
                    'country': 1,
                    'university': 1,
                    'program': 1,
                    'intake': 1,
                    'stepperId': 1,
                    'stepNumber': 1,
                    'stepStatus': 1,
                }
            }

        ])

        // console.log("result", result)

        res.status(200).json(result.reverse())

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })

    }
}

employeeCtrl.RetrieveTeamWorks = async (req, res) => {
    const leaderId = req.params.id;

    try {
        if (!isValidObjectId(leaderId)) return res.status(400).json({ msg: "Invalid Employee Id" });

        const members = await Employee.find({
            $or: [
                { leader: new ObjectId(leaderId) },
                { _id: new ObjectId(leaderId) },
            ],
        }, { _id: 1 });
        const memberIds = members?.map(member => member._id)

        const result = await Work.aggregate([
            {
                $match: { assignee: { $in: memberIds }, stepStatus: { $ne: "completed" } }
            },
            {
                $lookup: {
                    from: 'applications',
                    localField: 'applicationId',
                    foreignField: '_id',
                    as: 'applicationDetails'
                }
            },
            {
                $unwind: '$applicationDetails'
            },
            {
                $lookup: {
                    from: 'steppers',
                    localField: 'stepperId',
                    foreignField: '_id',
                    as: 'stepperDetails'
                }
            },
            {
                $unwind: '$stepperDetails'
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentDetails'
                }
            },
            {
                $unwind: '$studentDetails'
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'assignee',
                    foreignField: '_id',
                    as: 'employeeDetails'
                }
            },
            {
                $unwind: '$employeeDetails'
            },
            {
                $addFields: {
                    'studentName': '$studentDetails.name',
                    'assigneeName': '$employeeDetails.name',
                    'country': '$applicationDetails.country',
                    'university': '$stepperDetails.university',
                    'program': '$stepperDetails.program',
                    'intake': '$stepperDetails.intake',
                }
            },
            {
                $project: {
                    'studentName': 1,
                    'assigneeName': 1,
                    'applicationId': 1,
                    'country': 1,
                    'university': 1,
                    'program': 1,
                    'intake': 1,
                    'stepperId': 1,
                    'stepNumber': 1,
                    'stepStatus': 1,
                }
            }

        ])

        // console.log("result", result)

        res.status(200).json(result.reverse())

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })

    }
}


employeeCtrl.GetEmployeeTaskMetrics = async (req, res) => {
    const employeeId = req.params.id;

    try {
        if (!isValidObjectId(employeeId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee Not Found" });

        const allTasks = await Work.find({ assignee: employee._id }).countDocuments();
        const pendingTasks = await Work.find({ assignee: employee._id, stepStatus: 'pending' }).countDocuments();
        const currentTasks = await Work.find({ assignee: employee._id, stepStatus: 'ongoing' }).countDocuments();
        const completedTasks = await Work.find({ assignee: employee._id, stepStatus: 'completed' }).countDocuments();

        const result = [
            { name: "All", value: allTasks },
            { name: "Pending", value: pendingTasks },
            { name: "On-going", value: currentTasks },
            { name: "Completed", value: completedTasks },
        ]

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}

employeeCtrl.GetTeamTaskMetrics = async (req, res) => {
    const leaderId = req.params.id;

    try {
        if (!isValidObjectId(leaderId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const members = await Employee.find({
            $or: [
                { leader: new ObjectId(leaderId) },
                { _id: new ObjectId(leaderId) },
            ],
        }, { _id: 1 });
        const memberIds = members?.map(member => member._id)

        const allTasks = await Work.find({ assignee: { $in: memberIds } }).countDocuments();
        const pendingTasks = await Work.find({ assignee: { $in: memberIds }, stepStatus: 'pending' }).countDocuments();
        const currentTasks = await Work.find({ assignee: { $in: memberIds }, stepStatus: 'ongoing' }).countDocuments();
        const completedTasks = await Work.find({ assignee: { $in: memberIds }, stepStatus: 'completed' }).countDocuments();

        const result = [
            { name: "All", value: allTasks },
            { name: "Pending", value: pendingTasks },
            { name: "On-going", value: currentTasks },
            { name: "Completed", value: completedTasks },
        ]

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}

employeeCtrl.GetEmployeeLeadMetrics = async (req, res) => {
    const employeeId = req.params.id;

    try {
        if (!isValidObjectId(employeeId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee Not Found" });

        const allLeads = await Lead.find({ assignee: employee._id }).countDocuments();
        const UntouchedLeads = await Lead.find({ assignee: employee._id, status: 'Untouched' }).countDocuments();
        const ConvertedLeads = await Lead.find({ assignee: employee._id, status: 'Converted' }).countDocuments();
        const WarmLeads = await Lead.find({ assignee: employee._id, status: 'Warm' }).countDocuments();
        const HotLeads = await Lead.find({ assignee: employee._id, status: 'Hot' }).countDocuments();
        const NotContactableLeads = await Lead.find({ assignee: employee._id, status: 'Not Contactable' }).countDocuments();
        const ClosedLeads = await Lead.find({ assignee: employee._id, status: 'Closed' }).countDocuments();
        const VisaApprovedLeads = await Lead.find({ assignee: employee._id, status: 'Visa Approved' }).countDocuments();
        const NotInterestedLeads = await Lead.find({ assignee: employee._id, status: 'Not Interested' }).countDocuments();

        const result = [
            { name: "All", value: allLeads },
            { name: "Untouched", value: UntouchedLeads },
            { name: "Converted", value: ConvertedLeads },
            { name: "Warm", value: WarmLeads },
            { name: "Hot", value: HotLeads },
            { name: "Not Contactable", value: NotContactableLeads },
            { name: "Closed", value: ClosedLeads },
            { name: "Visa Approved", value: VisaApprovedLeads },
            { name: "Not Interested", value: NotInterestedLeads },
        ]

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}

employeeCtrl.GetTeamLeadMetrics = async (req, res) => {
    const leaderId = req.params.id;

    try {
        if (!isValidObjectId(leaderId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const members = await Employee.find({
            $or: [
                { leader: new ObjectId(leaderId) },
                { _id: new ObjectId(leaderId) },
            ],
        }, { _id: 1 });
        const memberIds = members?.map(member => member._id)

        const allLeads = await Lead.find({ assignee: { $in: memberIds } }).countDocuments();
        const UntouchedLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Untouched' }).countDocuments();
        const ConvertedLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Converted' }).countDocuments();
        const WarmLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Warm' }).countDocuments();
        const HotLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Hot' }).countDocuments();
        const NotContactableLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Not Contactable' }).countDocuments();
        const ClosedLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Closed' }).countDocuments();
        const VisaApprovedLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Visa Approved' }).countDocuments();
        const NotInterestedLeads = await Lead.find({ assignee: { $in: memberIds }, status: 'Not Interested' }).countDocuments();

        const result = [
            { name: "All", value: allLeads },
            { name: "Untouched", value: UntouchedLeads },
            { name: "Converted", value: ConvertedLeads },
            { name: "Warm", value: WarmLeads },
            { name: "Hot", value: HotLeads },
            { name: "Not Contactable", value: NotContactableLeads },
            { name: "Closed", value: ClosedLeads },
            { name: "Visa Approved", value: VisaApprovedLeads },
            { name: "Not Interested", value: NotInterestedLeads },
        ]

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}

// Change the code
employeeCtrl.GetEmployeeFollowMetrics = async (req, res) => {
    const employeeId = req.params.id;

    try {
        if (!isValidObjectId(employeeId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee Not Found" });

        const allFollowups = await Followup.find({ assignee: employee._id }).countDocuments();
        const CompletedFollowups = await Followup.find({ assignee: employee._id, isCompleted: true }).countDocuments();
        const IncompleteFollowups = await Followup.find({ assignee: employee._id, isCompleted: false }).countDocuments();


        const result = [
            { name: "All", value: allFollowups },
            { name: "Completed", value: CompletedFollowups },
            { name: "Incomplete", value: IncompleteFollowups },
        ]

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}

// Change the code
employeeCtrl.GetTeamFollowMetrics = async (req, res) => {
    const leaderId = req.params.id;

    try {
        if (!isValidObjectId(leaderId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const members = await Employee.find({
            $or: [
                { leader: new ObjectId(leaderId) },
                { _id: new ObjectId(leaderId) },
            ],
        }, { _id: 1 });
        const memberIds = members?.map(member => member._id)

        const allFollowups = await Followup.find({ assignee: { $in: memberIds } }).countDocuments();
        const CompletedFollowups = await Followup.find({ assignee: { $in: memberIds }, isCompleted: true }).countDocuments();
        const IncompleteFollowups = await Followup.find({ assignee: { $in: memberIds }, isCompleted: false }).countDocuments();

        const result = [
            { name: "All", value: allFollowups },
            { name: "Completed", value: CompletedFollowups },
            { name: "Incomplete", value: IncompleteFollowups },
        ]

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }

}

employeeCtrl.GetMyProjectTasks = async (req, res) => {
    const employeeId = req.params.id;

    try {
        if (!isValidObjectId(employeeId)) return res.status(400).json({ msg: "Invalid Employee Id" });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee Not Found" });

        const currentTasks = employee.currentTasks;

        const result = await Task.aggregate([
            { $match: { _id: { $in: [...currentTasks] } } },
            {
                $lookup: {
                    from: "comments",
                    localField: "comments",
                    foreignField: "_id",
                    as: "commentsDetails"
                }
            },
            {
                $group: {
                    _id: "$projectId",
                    tasks: { $push: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "projectDetails"
                }
            },
            {
                $sort: { _id: 1 }
            }

        ])

        res.status(200).json(result.reverse())

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}

employeeCtrl.WorkAssign = async (req, res) => {
    const { applicationId, employeeId, stepperId, stepNumber } = req.body;

    console.log(applicationId, employeeId, stepperId, stepNumber)

    try {
        if (!(isValidObjectId(applicationId) || isValidObjectId(employeeId))) {
            return res.status(400).json({ msg: "Invalid Id format" });
        };

        // Check if work already exists;
        const existWork = await Work.findOne({
            applicationId: new ObjectId(applicationId),
            stepperId: new ObjectId(stepperId),
            assignee: new ObjectId(employeeId),
            stepNumber,
        })

        if (existWork) return res.status(400).json({ msg: "Already Assigned" })


        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ msg: "Application not found" });

        if (application.phase === "completed" || application.phase === "cancelled") return res.status(404).json({ msg: "Inactive Application" });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ msg: "Employee not found" });


        //Update the assignee and status in that particular step

        const modifiedStepper = await Stepper.findOneAndUpdate({ _id: new ObjectId(stepperId), steps: { $elemMatch: { _id: stepNumber } } },
            { $set: { 'steps.$.assignee': employee._id, 'steps.$.status': "pending", 'steps.$.assignedDate': ISTDate() } }, { new: true }
        );

        const applicationStatus = modifiedStepper?.steps[stepNumber - 1]?.name;


        await Application.findByIdAndUpdate(application._id, {
            $push: { statuses: applicationStatus, assignees: employee._id }
        })


        const newWork = new Work({
            applicationId: application._id,
            stepperId: new ObjectId(stepperId),
            studentId: application.studentId,
            assignee: employee._id,
            stepNumber,
            stepStatus: "pending"
        })

        console.log("newWork", newWork)

        await newWork.save();

        res.status(200).json({ msg: "Work Assigned", modifiedStepper })
    } catch (error) {
        res.status(500).json({ msg: "Something went Wrong" })

    }
}




module.exports = employeeCtrl;