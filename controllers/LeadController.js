const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Lead = require("../models/LeadModel");
const { isValidObjectId } = require("mongoose");
const XLSX = require('xlsx');
const Student = require("../models/StudentModel");
const Application = require("../models/ApplicationModel");
const Followup = require("../models/FollowupModel");
const ISTDate = require("../middlewares/ISTDate");
const Employee = require("../models/EmployeeModel");
const Office = require("../models/OfficeModel");
const { sheet_to_json } = require('xlsx').utils;

const leadCtrl = {}

//Create Lead
leadCtrl.CreateLead = async (req, res, next) => {
    const { name, email, phone, country, leadSource, assignee, office } = req.body;

    try {
        if (!isValidObjectId(office)) {
            return res.status(400).json({ msg: "Invalid Office Id format" });
        }

        const isValidOffice = await Office.findById(office);

        if (!isValidOffice) {
            return res.status(400).json({ msg: "Invalid Office" });
        }

        if (assignee && !isValidObjectId(assignee)) return res.status(400).json({ msg: "Invalid Assignee" });

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });
        }

        const existing = await Lead.findOne({
            name, email, phone, country, leadSource,
            assignee: new ObjectId(assignee), office
        })

        if (existing) return res.status(409).json({ msg: "Lead already exists" });

        const createObj = { name, email, phone, country, leadSource, office }

        if (assignee && isValidObjectId(assignee)) {
            createObj.assignee = new ObjectId(assignee)
            createObj.assignedDate = ISTDate()
        }

        const newLead = await Lead.create(createObj)

        res.status(200).json({ newLead, msg: "New Lead Added" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Bulk Lead creation via Excel
leadCtrl.BulkLeadCreation = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "Invalid Excel Sheet" })
        const { assignee, office } = req.body

        if (!isValidObjectId(office)) {
            return res.status(400).json({ msg: "Invalid Office Id format" });
        }

        const isValidOffice = await Office.findById(office);

        if (!isValidOffice) {
            return res.status(400).json({ msg: "Invalid Office" });
        }

        const excelBuffer = req.file.buffer; // Access the buffer from multer

        const workbook = XLSX.read(excelBuffer, { type: 'buffer' })

        const sheetName = workbook.SheetNames[0]; // Get the first sheet name 
        const worksheet = workbook.Sheets[sheetName];

        // Access data using worksheet object
        const data = sheet_to_json(worksheet);

        console.log(data)

        const leadsArray = data?.map((lead) => {
            const obj = {
                name: lead['First NameLast Name'],
                email: lead['Email'],
                phone: lead['Phone Number'],
                country: lead['Country'],
                leadSource: lead['Lead Source'],
                office
            }

            if (assignee) {
                obj.assignee = new ObjectId(assignee)
                obj.assignedDate = ISTDate()
            }

            return obj;
        })

        const bulkleads = await Lead.insertMany(leadsArray)

        if (bulkleads?.length === 0) {
            return res.status(500).json({ msg: 'failed' })
        }

        console.log("bulkie", bulkleads)

        res.status(200).json({ msg: "New Leads Added" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Update Lead
leadCtrl.UpdateLead = async (req, res, next) => {
    const { leadId, name, email, phone, country, leadSource, assignee, status, convertible } = req.body;

    try {
        if (assignee && !isValidObjectId(assignee)) return res.status(400).json({ msg: "Invalid Assignee" });

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ msg: "Invalid Email format" });

        }

        const updateObj = {};

        if (name) { updateObj.name = name }
        if (email) { updateObj.email = email }
        if (phone) { updateObj.phone = phone }
        if (country) { updateObj.country = country }
        if (leadSource) { updateObj.leadSource = leadSource }
        if (assignee) {
            updateObj.assignee = new ObjectId(assignee)
            updateObj.assignedDate = ISTDate()
        }
        if (status) {
            updateObj.status = status
            updateObj.statusUpdatedAt = ISTDate()
        }

        const altLead = await Lead.findByIdAndUpdate(leadId, {
            $set: updateObj
        }, { new: true })

        if (convertible === true || status === "Converted") {
            let studentExist = await Student.findOne({ email: altLead.email }).lean()

            if (!studentExist) {
                const stdObj = { name: altLead.name, email: altLead.email };

                if (altLead.phone) { stdObj.phone = altLead.phone }

                studentExist = await Student.create(stdObj)

            }

            const application = await Application.create({
                studentId: studentExist?._id,
                country: altLead.country ? altLead.country : "NIL",
                creator: new ObjectId(assignee),
                office: altLead?.office,
            })

            if (application) {
                await Lead.findByIdAndUpdate(leadId, {
                    $set: { status: "Converted", statusUpdatedAt: ISTDate() }
                }, { new: true })
            }
        }

        res.status(200).json({ msg: "Lead Updated" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Bulk assign leads
leadCtrl.BulkAssign = async (req, res, next) => {
    try {
        const { leadList, assignee } = req.body;

        if (assignee && !isValidObjectId(assignee)) return res.status(400).json({ msg: "Invalid Assignee" });

        if (!Array.isArray(leadList)) return res.status(400).json({ msg: "Invalid Lead List" });

        if (leadList?.length === 0) return res.status(400).json({ msg: "Empty lead list" });

        const altLeadList = leadList.map((lead) => new ObjectId(lead))

        await Lead.updateMany({ _id: { $in: altLeadList } }, {
            $set: { assignee: new ObjectId(assignee), assignedDate: ISTDate() }
        })

        res.status(200).json({ msg: "New Assignee added to the leads" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Get a Lead
leadCtrl.GetALead = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).json({ msg: "Invalid id" });

        const lead = await Lead.findById(id)
            .populate('assignee', '_id name department')

        res.status(200).json(lead)

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Get Leads of an assignee
leadCtrl.GetMyLeads = async (req, res, next) => {
    try {
        const assignee = req.params.id;

        const leadSource = req.query.leadSource;
        const status = req.query.status;

        const startDateQuery = req.query.start_date;
        const endDateQuery = req.query.end_date;

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const searchQuery = req.query.search;

        const ORArray = [{ name: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { phone: { $regex: new RegExp(searchQuery, "i") } }];

        const filters = { $or: [...ORArray] }

        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }

        if (assignee) { filters.assignee = new ObjectId(assignee) }
        if (leadSource) { filters.leadSource = { $regex: new RegExp(leadSource, "i") } }
        if (status) { filters.status = { $regex: new RegExp(status, "i") } }


        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        if (!isValidObjectId(assignee)) return res.status(400).json({ msg: "Invalid Assignee id" });

        // console.log("filters", filters)

        const leads = await Lead.find({ ...filters })
            .populate('assignee', '_id name department')

        const count = leads?.length

        // console.log("leads",leads)

        let result = leads.sort((a, b) => new Date(b.updatedAt - a.updatedAt))

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ lead: result, count })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

leadCtrl.GetLeadsofTeamMembers = async (req, res, next) => {
    try {
        const leaderId = req.params.id;

        const members = await Employee.find({
            isActive: true,
            $or: [{ leader: new ObjectId(leaderId) }, { _id: new ObjectId(leaderId) }]
        },
            { _id: 1 });

        const memberIds = members.map((member) => member._id)

        // const date = req.query.date;
        const leadSource = req.query.leadSource;
        const status = req.query.status;
        const assignee = req.query.assignee;

        const startDateQuery = req.query.start_date;
        const endDateQuery = req.query.end_date;

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const searchQuery = req.query.search;

        const ORArray = [{ name: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { phone: { $regex: new RegExp(searchQuery, "i") } }];

        const filters = { $or: [...ORArray], assignee: { $in: memberIds } }

        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }

        if (leadSource) { filters.leadSource = { $regex: new RegExp(leadSource, "i") } }
        if (status) { filters.status = { $regex: new RegExp(status, "i") } }
        if (assignee && isValidObjectId(assignee)) { filters.assignee = new ObjectId(assignee) }

        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        // console.log("filters", filters)

        const leads = await Lead.find({ ...filters })
            .populate('assignee', '_id name department')

        const count = leads?.length

        // console.log("leads",leads)

        let result = leads.sort((a, b) => new Date(b.updatedAt - a.updatedAt))

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ lead: result, count })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Get All Leads
leadCtrl.GetAllLeads = async (req, res, next) => {
    try {
        const leadSource = req.query.leadSource;
        const status = req.query.status;
        const assignee = req.query.assignee;

        const startDateQuery = req.query.start_date;
        const endDateQuery = req.query.end_date;

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const searchQuery = req.query.search;

        const ORArray = [{ name: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { phone: { $regex: new RegExp(searchQuery, "i") } }];

        const filters = { $or: [...ORArray] }

        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }

        if (leadSource) { filters.leadSource = { $regex: new RegExp(leadSource, "i") } }
        if (status) { filters.status = { $regex: new RegExp(status, "i") } }
        if (assignee && isValidObjectId(assignee)) { filters.assignee = new ObjectId(assignee) }

        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        const leads = await Lead.find(filters)
            .populate('assignee', '_id name department')

        const count = leads?.length

        let result = leads.reverse();

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ lead: result, count })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Delete a Lead
leadCtrl.DeleteALead = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).json({ msg: "Invalid id" });

        const lead = await Lead.findByIdAndDelete(id)
        if (!lead) return res.status(400).json({ msg: "Lead not found" })

        res.status(200).json({ msg: "Lead Deleted" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}


leadCtrl.createFollowup = async (req, res) => {
    const { leadId, assignee, dueDate, note, dueTime, office } = req.body;

    console.log(req.body)

    try {
        if (!isValidObjectId(office)) {
            return res.status(400).json({ msg: "Invalid Office Id format" });
        }

        const isValidOffice = await Office.findById(office);

        if (!isValidOffice) {
            return res.status(400).json({ msg: "Invalid Office" });
        }

        if (!isValidObjectId(leadId)) return res.status(400).json({ msg: "Invalid Lead" });

        if (!dueDate) return res.status(400).json({ msg: "Invalid Due Date" });

        const result = await Followup.create({
            leadId: new ObjectId(leadId), assignee: new ObjectId(assignee),
            dueDate, note, dueTime, office
        })

        console.log(result)

        res.status(200).json({ msg: "Followup Added", result })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

leadCtrl.updateFollowup = async (req, res) => {
    const followupId = req.params.id;
    const { dueDate, note, isCompleted, dueTime } = req.body;

    try {
        if (!isValidObjectId(followupId)) return res.status(400).json({ msg: "Invalid Lead" });

        await Followup.findByIdAndUpdate(followupId, { $set: { dueDate: dueDate, note: note, isCompleted: isCompleted, dueTime } })

        res.status(200).json({ msg: "Followup Updated" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

leadCtrl.getAFollowup = async (req, res) => {
    const id = req.params.id;

    try {
        if (!isValidObjectId(id)) return res.status(400).json({ msg: "Invalid Lead" });

        const followup = await Followup.findById(id)
            .populate('assignee', '_id name department')

        res.status(200).json(followup)

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }

}

leadCtrl.getFollowupsOfALead = async (req, res) => {
    const leadId = req.params.id;

    try {
        if (!isValidObjectId(leadId)) return res.status(400).json({ msg: "Invalid Lead" });

        const filters = { leadId: new ObjectId(leadId) }
        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }

        const followups = await Followup.find(filters)
            .populate('assignee', '_id name department')

        console.log("leadFollowups", followups)

        res.status(200).json(followups?.reverse())

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }

}

leadCtrl.getAllFollowups = async (req, res) => {

    try {
        const status = req.query.status
        const notePresence = req.query.notePresence

        const startDateQuery = req.query.start_date;
        const endDateQuery = req.query.end_date;

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const currentDate = ISTDate();

        const todate = currentDate.toISOString().split("T")[0];

        const filters = {}
        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }


        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        if (status === "today") {
            filters.dueDate = todate
        }
        else if (status === "upcoming") {
            filters.dueDate = {
                $gt: todate
            }

            filters.isCompleted = false
        }
        else if (status === "overdue") {
            filters.dueDate = {
                $lt: todate
            }

            filters.isCompleted = false
        }
        else if (status === "completed") {
            filters.isCompleted = true
        }

        if (notePresence === "present") {
            filters.note = { $ne: "" }
        }
        else if (notePresence === "absent") {
            filters.note = { $eq: "" }
        }

        const followups = await Followup.find(filters)
            .populate('leadId', '_id name email phone')
            .populate('assignee', '_id name department').lean()

        const followWithStatus = followups.map((elem) => {
            let status = "Not-completed"

            if (elem.isCompleted === true) {
                status = "Completed"

            } else {
                const currentDayStart = new Date(currentDate.setUTCHours(0, 0, 0, 0)).getTime();
                console.log("CDS", currentDayStart)
                console.log("EDD", elem.dueDate)

                if (elem.dueDate.getTime() > currentDayStart) {
                    status = "Upcoming"
                }
                else if (elem.dueDate.getTime() < currentDayStart) {
                    status = "Overdue"
                }
                else if (elem.dueDate.getTime() == currentDayStart) {
                    status = "Today's"
                }
            }

            return { ...elem, status }
        })

        let result = followWithStatus.sort((a, b) => new Date(a.dueDate - b.dueDate))

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result)

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }

}

leadCtrl.getTeamFollowups = async (req, res) => {

    try {
        const status = req.query.status
        const notePresence = req.query.notePresence


        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const startDateQuery = req.query.start_date;
        const endDateQuery = req.query.end_date;

        const leaderId = req.params.id;
        if (!isValidObjectId(leaderId)) return res.status(400).json({ msg: "Invalid Id" });


        const members = await Employee.find({
            isActive: true,
            $or: [{ leader: new ObjectId(leaderId) }, { _id: new ObjectId(leaderId) }]
        },
            { _id: 1 });

        const memberIds = members.map((member) => member._id)

        const currentDate = ISTDate();
        console.log("currentDate", currentDate)

        const todate = currentDate.toISOString().split("T")[0];

        const filters = { assignee: { $in: memberIds } }
        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }


        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        if (status === "today") {
            filters.dueDate = todate
        }
        else if (status === "upcoming") {
            filters.dueDate = {
                $gt: todate
            }

            filters.isCompleted = false
        }
        else if (status === "overdue") {
            filters.dueDate = {
                $lt: todate
            }

            filters.isCompleted = false
        }
        else if (status === "completed") {
            filters.isCompleted = true
        }

        if (notePresence === "present") {
            filters.note = { $ne: "" }
        }
        else if (notePresence === "absent") {
            filters.note = { $eq: "" }
        }

        const followups = await Followup.find(filters)
            .populate('leadId', '_id name email phone')
            .populate('assignee', '_id name department').lean()

        const followWithStatus = followups.map((elem) => {
            let status = "Not-completed"

            if (elem.isCompleted === true) {
                status = "Completed"

            } else {
                const currentDayStart = new Date(currentDate.setUTCHours(0, 0, 0, 0)).getTime();
                console.log("CDS", currentDayStart)
                console.log("EDD", elem.dueDate)

                if (elem.dueDate.getTime() > currentDayStart) {
                    status = "Upcoming"
                }
                else if (elem.dueDate.getTime() < currentDayStart) {
                    status = "Overdue"
                }
                else if (elem.dueDate.getTime() == currentDayStart) {
                    status = "Today's"
                }
            }

            return { ...elem, status }
        })

        let result = followWithStatus.sort((a, b) => new Date(a.dueDate - b.dueDate))

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result)

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }

}

leadCtrl.getEmpsFollowups = async (req, res) => {

    try {
        const assignee = req.params.id
        const status = req.query.status
        const notePresence = req.query.notePresence

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const startDateQuery = req.query.start_date;
        const endDateQuery = req.query.end_date;

        if (!isValidObjectId(assignee)) return res.status(400).json({ msg: "Invalid Id" });

        const currentDate = ISTDate();
        // console.log("currentDate", currentDate)

        const todate = currentDate.toISOString().split("T")[0];

        const filters = { assignee: new ObjectId(assignee) }

        const { office } = req.query;
        if (isValidObjectId(office)) {
            filters.office = office;
        }

        if (startDateQuery && endDateQuery) {
            const startDate = new Date(`${startDateQuery}T00:00:00.000+05:30`);
            const endDate = new Date(`${endDateQuery}T00:00:00.000+05:30`);
            filters.createdAt = { $gte: startDate, $lte: endDate }
        };

        if (status === "today") {
            filters.dueDate = todate
        }
        else if (status === "upcoming") {
            filters.dueDate = {
                $gt: todate
            }

            filters.isCompleted = false
        }
        else if (status === "overdue") {
            filters.dueDate = {
                $lt: todate
            }

            filters.isCompleted = false
        }
        else if (status === "completed") {
            filters.isCompleted = true
        }

        if (notePresence === "present") {
            filters.note = { $ne: "" }
        }
        else if (notePresence === "absent") {
            filters.note = { $eq: "" }
        }

        const followups = await Followup.find(filters)
            .populate('leadId', '_id name email phone')
            .populate('assignee', '_id name department').lean()

        const followWithStatus = followups.map((elem) => {
            let status = "Not-completed"

            if (elem.isCompleted === true) {
                status = "Completed"

            } else {
                const currentDayStart = new Date(currentDate.setUTCHours(0, 0, 0, 0)).getTime();
                console.log("CDS", currentDayStart)
                console.log("EDD", elem.dueDate)

                if (elem.dueDate.getTime() > currentDayStart) {
                    status = "Upcoming"
                }
                else if (elem.dueDate.getTime() < currentDayStart) {
                    status = "Overdue"
                }
                else if (elem.dueDate.getTime() == currentDayStart) {
                    status = "Today's"
                }
            }

            return { ...elem, status }
        })

        let result = followWithStatus.sort((a, b) => new Date(a.dueDate - b.dueDate))

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json(result)

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong" });
    }

}

module.exports = leadCtrl;