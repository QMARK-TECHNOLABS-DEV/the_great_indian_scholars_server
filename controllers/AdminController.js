const bcrypt = require("bcrypt");
const Admin = require("../models/AdminModel");
const mongoose = require("mongoose");
const Application = require("../models/ApplicationModel");
const Employee = require("../models/EmployeeModel");
const { isValidObjectId } = require("mongoose");
const Lead = require("../models/LeadModel");
const Office = require("../models/OfficeModel");
const Student = require("../models/StudentModel");
const Work = require("../models/WorkModel");
const Followup = require("../models/FollowupModel");

const adminCtrl = {};

// Get Details;
adminCtrl.GetAdmin = async (req, res) => {
    const adminId = req.params.id;

    try {
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const admin = await Admin.findById(adminId, { password: 0 });
        // console.log(admin);

        if (!admin) return res.status(404).json({ msg: "Admin Not found" });

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}

// Update Admin;
adminCtrl.UpdateAdmin = async (req, res) => {
    // console.log(req.body);
    const adminId = req.body.adminId;

    try {
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ msg: "Admin not found" });

        if (req.body.name) {
            {
                const nameRegex = /^[A-Za-z ]{3,}$/;
                if (!nameRegex.test(req.body.name)) return res.status(400).json({ msg: "Invalid Name format" });
            }
        }

        if (req.body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) return res.status(400).json({ msg: "Invalid Email format" });
        }

        if (req.body.password) {

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            req.body.password = hashedPassword;
        }

        console.log("req.body", req.body);

        const updatedDocument = await Admin.findByIdAndUpdate(adminId, {
            $set: req.body
        }, { new: true });

        console.log("updatedDoc", updatedDocument)

        res.status(200).json({ msg: "Admin Updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Change password;
adminCtrl.ChangePassword = async (req, res) => {
    const adminId = req.body.adminId;
    const password = req.body.password;

    try {
        if (!isValidObjectId(adminId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ msg: "Admin not found" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await Admin.findByIdAndUpdate(adminId, {
            $set: { password: hashedPassword }
        })

        res.status(200).json({ msg: "Password changed" });
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}

// Get Application Metrics ==>Count of Application (All, Current, Completed, Cancelled), Non-enrollments, Deferrals;
// Filters ==> Country, Intake, Date , Year.

adminCtrl.GetApplicationMetrics = async (req, res) => {
    const country = req.query.country;
    const intake = req.query.intake;
    const startDateQuery = req.query.start_date;
    const endDateQuery = req.query.end_date;
    const year = req.query.year;
    const office = req.query.office;

    try {
        let filters = {};
        const leadFilter = {}

        if (country) {
            filters.country = { $regex: new RegExp(country, 'i') }
            leadFilter.country = country;
        };

        if (intake) {
            filters.intakes = intake
            leadFilter.intake = intake;
        };

        if (isValidObjectId(office)) {
            filters.office = office;
            leadFilter.office = office;
        }

        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        if (year) {
            const yearStart = new Date(`${year}-01-01T00:00:00.000+05:30`);
            const yearEnd = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000+05:30`);

            filters.createdAt = { $gte: yearStart, $lt: yearEnd };
        };

        // console.log(filters);

        const allApplications = await Application.countDocuments(filters)
        // console.log("all", allApplications);

        const pendingApplications = await Application.countDocuments({ ...filters, phase: "pending" })
        // console.log("processing", pendingApplications);

        const ongoingApplications = await Application.countDocuments({ ...filters, phase: "ongoing" })
        // console.log("processing", ongoingApplications);

        const completedApplications = await Application.countDocuments({ ...filters, phase: "completed" })
        // console.log("completed", completedApplications);

        const defferredApplications = await Application.countDocuments({ ...filters, phase: "deffered" })
        // console.log("deffered", defferredApplications);

        const cancelledApplications = await Application.countDocuments({ ...filters, phase: "cancelled" })
        // console.log("cancelled", cancelledApplications);

        const notEnrolledApplications = await Application.countDocuments({ ...filters, phase: "not-enrolled" })
        // console.log("not-enrolled", notEnrolledApplications);

        const totalLeads = await Lead.countDocuments(leadFilter)

        res.status(200).json([
            { name: "Total Lead", value: totalLeads },
            { name: "All", value: allApplications },
            { name: "Pending", value: pendingApplications },
            { name: "On-going", value: ongoingApplications },
            { name: "Completed", value: completedApplications },
            { name: "Deffered", value: defferredApplications },
            { name: "Cancelled", value: cancelledApplications },
            { name: "Non-enrolled", value: notEnrolledApplications },
        ])

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}


adminCtrl.GetEmpBasedLeadsnApps = async (req, res) => {

    try {
        const date = req.query.date;
        const office = req.query.office;

        const filters = {};

        const matchFilters = {
            isActive: true
        }

        if (isValidObjectId(office)) {
            matchFilters.office = office;
        }

        if (date) {
            const altDate = new Date(date);
            const startDate = new Date(altDate).setUTCHours(0, 0, 0, 0);
            const endDate = new Date(altDate).setUTCHours(23, 59, 59, 999);

            // console.log('startDate', new Date(startDate))
            // console.log('endDate', new Date(endDate))

            filters.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };

            filters.assignedDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const result = await Employee.aggregate([
            {
                $match: matchFilters
            },
            {
                $lookup: {
                    from: "works",
                    localField: "_id",
                    foreignField: "assignee",
                    as: "theWorks",
                    pipeline: [
                        { $match: { createdAt: filters.createdAt } },
                    ],
                }
            },
            {
                $lookup: {
                    from: "leads",
                    localField: "_id",
                    foreignField: "assignee",
                    as: "theLeads",
                    pipeline: [
                        { $match: { assignedDate: filters.assignedDate } },
                    ],
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    workCount: { $size: "$theWorks" },
                    leadCount: { $size: "$theLeads" },
                }
            },
            {
                $sort: { name: 1 }
            },
        ])

        // console.log(result)

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}


adminCtrl.AllLeadsnApps = async (req, res) => {
    try {
        const office = req.query.office;
        const filters = {}
        if (isValidObjectId(office)) {
            filters.office = office;
        }

        const applCount = await Application.countDocuments(filters)
        const leadCount = await Lead.countDocuments(filters)

        // console.log({applCount,leadCount})

        res.status(200).json({ applCount, leadCount })

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Something went wrong" })
    }
}


adminCtrl.LeadStages = async (req, res) => {
    try {
        const date = req.query.date;
        const office = req.query.office;

        const filters = {};

        if (isValidObjectId(office)) {
            filters.office = office;
        }

        if (date) {
            const altDate = new Date(date);
            const startDate = new Date(altDate).setUTCHours(0, 0, 0, 0);
            const endDate = new Date(altDate).setUTCHours(23, 59, 59, 999);

            // console.log('startDate', new Date(startDate));
            // console.log('endDate', new Date(endDate));

            filters.statusUpdatedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const leadStages = [
            { count: 0, _id: "Untouched" },
            { count: 0, _id: "Converted" },
            { count: 0, _id: "Warm" },
            { count: 0, _id: "Hot" },
            { count: 0, _id: "Not Contactable" },
            { count: 0, _id: "Closed" },
            { count: 0, _id: "Visa Approved" },
            { count: 0, _id: "Not Interested" },
        ];

        const result = await Lead.aggregate([
            { $match: { ...filters } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const mergedStages = leadStages.map((stage) => {
            const match = result.find((item) => item._id === stage._id);
            return match ? { ...stage, count: match.count } : stage;
        });

        //   console.log(mergedStages);
        res.status(200).json(mergedStages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
};


// Office CUD
adminCtrl.createOffice = async (req, res) => {
    try {
        const { name } = req.body;

        const newDoc = await Office.create({
            name
        })

        console.log({ newDoc })

        res.status(200).json({ office: newDoc, msg: 'New office added' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

adminCtrl.updateOffice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) { return res.status(400).json({ msg: "Invalid Id" }); }

        const { name } = req.body;

        const office = await Office.findByIdAndUpdate(id, { $set: { name } }, { new: true })

        if (!office) return res.status(404).json({ msg: "Office Not found" });
        console.log({ office })


        res.status(200).json({ office: office, msg: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

adminCtrl.deleteOffice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) { return res.status(400).json({ msg: "Invalid Id" }); }

        const office = await Office.findByIdAndDelete(id)

        if (office) {
            await Employee.updateMany(
                { office: office._id },
                { $unset: { office: 1 } }
            );

            await Student.updateMany(
                { office: office._id },
                { $unset: { office: 1 } }
            );
        } else {
            return res.status(404).json({ msg: "Office Not found" });
        }

        res.status(200).json({ office: office, msg: 'success' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

adminCtrl.getTeamLeaderStatistics = async (req, res) => {
    try {
        const leaders = await Employee.find({ role: "leader" }, { _id: 1, name: 1 })

        const mappedLeaders = await Promise.all(
            leaders?.map(async (leader) => {
                const members = await Employee.find({
                    $or: [
                        { leader: leader?._id },
                        { _id: leader?._id },
                    ],
                }, { _id: 1 });

                const memberIds = members?.map(member => member._id)

                const [allTasks, allLeads, allFollowups] = await Promise.all([
                    Work.countDocuments({ assignee: { $in: memberIds } }),
                    Lead.countDocuments({ assignee: { $in: memberIds } }),
                    Followup.countDocuments({ assignee: { $in: memberIds } }),
                ])

                return {
                    _id: leader?._id,
                    name: leader?.name,
                    counts: {
                        leads: allLeads,
                        tasks: allTasks,
                        followups: allFollowups
                    }
                }
            }))


        res.status(200).json({ msg: 'success', result: mappedLeaders })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

module.exports = adminCtrl;
