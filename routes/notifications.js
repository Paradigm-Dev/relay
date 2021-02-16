const express = require("express");
const webpush = require("web-push");
const router = express.Router();

const UserModel = require("../models/User.js");

const { private_key, public_key } = require("../config/vapid.js");
const { Types } = require("mongoose");

webpush.setVapidDetails(
  "mailto:paradigmdevelop@gmail.com",
  public_key,
  private_key
);

router.post("/:uid/subscribe", async (req, res) => {
  const subscription = {
    data: req.body.data,
    _id: req.body._id || Types.ObjectId(),
  };

  res.json(subscription);

  const payload = JSON.stringify({
    title: "Paradigm",
    body: "Push notifications activated on this device.",
  });

  webpush
    .sendNotification(subscription.data, payload)
    .catch((err) => console.error(err));

  await UserModel.findOneAndUpdate(
    { _id: req.params.uid },
    { $push: { notifications: subscription } }
  );
});

router.post("/gh-release", async (req, res) => {
  res.status(200).json({});

  const users = await UserModel.find({});

  let payload;

  if (req.body.release) {
    payload = JSON.stringify({
      title: req.body.release.name,
      body: "New Paradigm update released!",
    });
  } else {
    payload = JSON.stringify({
      title: "Paradigm",
      body: "New Paradigm update released!",
    });
  }

  users.forEach((user) => {
    user.notifications.forEach((subscription) => {
      webpush
        .sendNotification(subscription, payload)
        .catch((err) => console.error(err));
    });
  });
});

module.exports = router;
