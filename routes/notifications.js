const express = require("express");
const webpush = require("web-push");
const router = express.Router();

const UserModel = require("../models/User.js");

const { private_key, public_key } = require("../config/vapid.js");

webpush.setVapidDetails(
  "mailto:paradigmdevelop@gmail.com",
  public_key,
  private_key
);

// Subscribe Route
router.post("/:uid/subscribe", async (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;

  // Send 201 - resource created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({
    title: "Paradigm",
    body: "Push notifications activated on this device.",
  });

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));

  await UserModel.findOneAndUpdate(
    { _id: req.params.uid },
    { $push: { notifications: subscription } }
  );
});

module.exports = router;
