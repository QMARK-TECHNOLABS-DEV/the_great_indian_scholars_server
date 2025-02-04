const Admin = require('../models/AdminModel');
const Employee = require('../models/EmployeeModel');
const Notify = require('../models/Notify');
const { Subscription } = require('../models/Subscription');
const webpush = require("web-push");
const notifyCtrl = {}


const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

webpush.setVapidDetails(
    "mailto:abhijithrb91@gmail.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// **1. Employee Subscribes for Push Notifications**

notifyCtrl.subscribe = async (req, res) => {
    try {
        const { userId, subscription } = req.body;

        // Store subscription in MongoDB
        await Subscription.findOneAndUpdate(
            { userId },
            { subscription },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "Subscription stored for employee " + userId });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Internal server error' })
    }
}

const sendHandler = async ({ userId, title, body, notificationType, route }, subscriptionMap) => {
    try {
        await Notify.create({
            userId,
            title,
            body,
            notificationType,
            route
        })

        const subscriptionData = subscriptionMap.get(userId.toString());
        if (subscriptionData) {
            const payload = JSON.stringify({ title, message: body });
            await webpush.sendNotification(subscriptionData?.subscription, payload);

            return { userId, success: true };
        }

        return { userId, success: false, error: "No subscription found" }

    } catch (error) {
        throw new Error("Failed to send notification")
    }
}

notifyCtrl.sendSingleNotification = async (req, res) => {
    try {
        const { userId, title, body, notificationType, route } = req.body;

        const subscriptions = await Subscription.find({ userId });
        const subscriptionMap = new Map(subscriptions.map(sub => [sub.userId.toString(), sub]));

        await sendHandler({ userId, title, body, notificationType, route }, subscriptionMap)

        res.status(200).json({ message: `Notification sent to User ${userId}` });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Internal server error' })
    }
}


notifyCtrl.getSingleNotification = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ msg: 'Invalid Id' })

        const notification = await Notify.findById(id)

        if (!notification) { return res.status(404).json({ msg: 'Notification not found' }) }

        res.status(200).json({ notification, msg: 'success' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to fetch' });
    }
}

notifyCtrl.getUserNotifications = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ msg: 'Invalid Id' })

        const filters = { userId: id }

        const { readStatus, notificationType } = req.query;

        if (readStatus) {
            if (readStatus === 'read') {
                filters.isRead = true;
            }
            else if (readStatus === 'unread') {
                filters.isRead = false;
            }
        }

        if (notificationType) {
            filters.notificationType = notificationType;
        }

        const notifications = await Notify.find(filters)

        res.status(200).json({ notification: notifications, msg: 'success' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Failed to fetch' });
    }
}

notifyCtrl.alterReadStatus = async (req, res) => {
    try {
        const { selected, status, userId } = req.body;

        if (!Array.isArray(selected)) { return res.status(400).json({ msg: 'Selected not an array' }) }

        const validArray = selected?.length && selected.every(item => isValidObjectId(item))
        if (!validArray) { return res.status(400).json({ msg: 'Invalid Id/s' }) }

        if (!['read', 'unread']?.includes(status)) { return res.status(400).json({ msg: 'Invalid status' }) }

        const filter = {}
        if (status === 'read') { filter.isRead = true }
        else if (status === 'unread') { filter.isRead = false }

        const updatedDocuments = await Notify.updateMany({ _id: { $in: selected } },
            { $set: filter }, { new: true }
        )

        console.log({ updatedDocuments })
        if (!updatedDocuments?.modifiedCount) { return res.status(409).json({ msg: 'Unable to update status' }) }

        const notifications = await Notify.find({ userId })

        res.status(200).json({ notification: notifications, msg: 'success' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' });
    }
}


notifyCtrl.sendMutipleNotifications = async (req, res) => {
    try {
        const { userIdList, title, body, notificationType, route } = req.body;
        console.log(req.body);

        if (!Array.isArray(userIdList) || !userIdList.length) {
            return res.status(400).json({ msg: "userIdList is required and should be a non-empty array" });
        }

        const [admins, employees] = await Promise.all([
            Admin.find({ _id: { $in: userIdList } }),
            Employee.find({ _id: { $in: userIdList } })
        ]);

        const allUsers = [...admins, ...employees];
        const subscriptions = await Subscription.find({ userId: { $in: userIdList } });
        const subscriptionMap = new Map(subscriptions.map(sub => [sub.userId.toString(), sub]));

        const results = await Promise.allSettled(
            allUsers.map(user => sendHandler({ userId: user._id, title, body, notificationType, route }, subscriptionMap))
        );

        const failedUsers = results
            .filter(result => result.status === "fulfilled" && !result.value.success)
            .map(result => ({ userId: result.value.userId, error: result.value.error }));

        if (failedUsers.length) {
            console.log(`Failed to process notifications for:`, failedUsers);
        }

        res.status(200).json({
            msg: "Notifications processed successfully",
            failedUsers
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Failed to process notifications' });
    }
};

module.exports = { notifyCtrl }