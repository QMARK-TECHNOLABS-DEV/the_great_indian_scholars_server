const mongoose = require("mongoose");
const Comment = require("../models/CommentModel");
const Stepper = require("../models/StepperModel");
const Employee = require("../models/EmployeeModel");
const Task = require("../models/TaskModel");
const Application = require("../models/ApplicationModel");
const ObjectId = mongoose.Types.ObjectId;
const { isValidObjectId } = require("mongoose");
const commentCtrl = {};

const resourceTypes = ["stepper", "task"]

// Get all Comments of an Stepper/Task of Project;
commentCtrl.GetComments = async (req, res) => {
    const resourceId = req.params.id;
    const resourceType = req.params.type;

    try {
        if (!isValidObjectId(resourceId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        if (!resourceTypes.includes(resourceType)) {
            return res.status(400).json({ msg: "Resource type is invalid" })
        }

        const comments = await Comment.aggregate([
            {
                $match: {
                    resourceId: new ObjectId(resourceId),
                    resourceType : resourceType
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "commentorId",
                    foreignField: "_id",
                    as: "employeeCommentor"
                }
            },
            {
                $addFields: {
                    "commentor": {
                        $cond: {
                            if: "$fromAdmin",
                            then: "Admin",
                            else: { $arrayElemAt: ["$employeeCommentor.name", 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    "resourceId": 1,
                    "resourceType": 1,
                    "commentor": 1,
                    "comment": 1,
                    "createdAt": 1
                }
            },
            {
                $sort: {
                    "_id": -1
                }
            }
        ]);

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" });
    }
}

// Add comment;
// In case of Project, resourceId wil be taskId and resourceType will be task
commentCtrl.AddComment = async (req, res) => {
    const { resourceId, resourceType,
        commentorId, comment } = req.body;

    try {
        const fromAdmin = req.user.role === "admin";

        if (!isValidObjectId(resourceId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        if (!resourceTypes.includes(resourceType)) {
            return res.status(400).json({ msg: "Resource type is invalid" })
        }

        if (!isValidObjectId(commentorId)) {
            return res.status(400).json({ msg: "Invalid Id format" });
        }

        if (!comment.trim()) {
            return res.status(400).json({ msg: "Invalid Comment" });
        };

        if (!fromAdmin) {
            const commentorExists = await Employee.findById(commentorId);
            if (!commentorExists) return res.status(404).json({ msg: "Commentor doesn't exist" })
        }

        if (resourceType === "stepper") {
            const StepperExists = await Stepper.findById(resourceId);

            if (!StepperExists) {
                return res.status(400).json({ msg: "Stepper doesn't exists" })
            }

            const application = await Application.findById(StepperExists.applicationId)
            if (!application) return res.status(404).json({ msg: "Application not found" })

            if (application.phase === "completed" || application.phase === "cancelled") return res.status(404).json({ msg: "Inactive Application" });

        }
        else if (resourceType === "task") {
            const taskExists = await Task.findById(resourceId);

            if (!taskExists) {
                return res.status(400).json({ msg: "Task doesn't exist" })
            }
        }

        const newComment = new Comment({
            resourceId: new ObjectId(resourceId),
            resourceType,
            commentorId: commentorId,
            comment: comment.trim(),
            fromAdmin
        });

        const savedComment = await newComment.save();
        console.log(savedComment);

        if (resourceType === "task") {
            await Task.updateOne({ _id: new ObjectId(resourceId) },
                { $push: { comments: savedComment._id } }
            )
        }

        res.status(200).json({ data: savedComment, msg: "Comment Added" });

    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" })
    }
}


module.exports = commentCtrl;