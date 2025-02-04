const { notifyCtrl } = require("../controllers/NotificationController");

const notifyRouter = require("express").Router();

notifyRouter.post('/subscribe', notifyCtrl.subscribe)
notifyRouter.post('/send/single', notifyCtrl.sendSingleNotification)
notifyRouter.post('/send/multiple', notifyCtrl.sendMutipleNotifications)

notifyRouter.get('/users/:id', notifyCtrl.getUserNotifications)
notifyRouter.get('/:id', notifyCtrl.getSingleNotification)
notifyRouter.put('/status', notifyCtrl.alterReadStatus)

module.exports = { notifyRouter }