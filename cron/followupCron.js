const cron = require("node-cron");
const webpush = require("web-push");
const Followup = require("../models/FollowupModel");
const { Subscription } = require("../models/Subscription");
const Notify = require("../models/Notify");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = "Asia/Kolkata";

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

const MAIL_USER = process.env.MAIL_USER;

webpush.setVapidDetails(`mailto:${MAIL_USER}`, vapidKeys.publicKey, vapidKeys.privateKey);

const sendPushNotification = (subscription, payload) => {
    console.log({subscription, payload})
    webpush.sendNotification(subscription, payload);
};

// Job 1: Send notifications the day before the due date at 9 AM IST
cron.schedule("0 9 * * *", async () => {
    console.log("🔔 Checking follow-ups due tomorrow at 9 AM IST...");

    const tomorrow = dayjs().tz(IST_TIMEZONE).add(1, "day").startOf("day"); 
    const tomorrowDate = tomorrow.format("YYYY-MM-DD"); 

    const followups = await Followup.find({ dueDate: tomorrowDate, isCompleted: false });

    followups.forEach(async (followup) => {
        if (followup?.assignee) {
            await Notify.create({
                userId: followup.assignee,
                title: "Reminder: Follow-Up Due Tomorrow",
                body: `You have a follow-up task due tomorrow (${followup.dueDate}).`,
                notificationType: "reminder",
            });

            const sub = await Subscription.findOne({ userId: String(followup.assignee) });
            if (sub?.subscription) {
                const payload = JSON.stringify({
                    title: "Reminder: Follow-Up Due Tomorrow",
                    message: `You have a follow-up task due tomorrow (${followup.dueDate}).`,
                });

                sendPushNotification(sub.subscription, payload);
            }
        }
    });
});

// Job 2: Send notifications 1 hour before due time
cron.schedule("* * * * *", async () => {
    console.log("🔔 Checking follow-ups due in the next hour...");

    const now = dayjs().tz(IST_TIMEZONE);
    const todayStart = now.startOf("day");
    const todayEnd = now.endOf("day"); 

    const followups = await Followup.find({
        dueDate: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
        isCompleted: false,
    });

    followups.forEach(async (followup) => {
        if (followup.assignee && followup.dueTime) {
            const [hour, minute] = followup.dueTime.split(":").map(Number);

            const followupTime = dayjs(followup.dueDate).tz(IST_TIMEZONE).hour(hour).minute(minute).second(0);

            const timeDifference = followupTime.diff(now, "minutes");

            console.log("🕒 Current Time (IST):", now.format());
            console.log("📅 Follow-up Time (IST):", followupTime.format());
            console.log("⏳ Time Difference (minutes):", timeDifference);

            // Send notification exactly **1 hour before**
            if (timeDifference === 60) {
                await Notify.create({
                    userId: followup.assignee,
                    title: "Upcoming Follow-Up",
                    body: `Your follow-up task is due at ${followup.dueTime}.`,
                    notificationType: "reminder",
                });

                const sub = await Subscription.findOne({ userId: String(followup.assignee) });
                if (sub?.subscription) {
                    const payload = JSON.stringify({
                        title: "Upcoming Follow-Up",
                        message: `Your follow-up task is due at ${followup.dueTime}.`,
                    });

                    console.log({sub: sub.subscription, payload})
                    sendPushNotification(sub.subscription, payload);
                }
            }
        }
    });
});

console.log("Follow-up cron jobs scheduled.");
