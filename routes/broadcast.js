const express = require("express");
const webpush = require("web-push");
const router = express.Router();

const UserModel = require("../models/User.js");

router.post("/:uid/create", async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid });
  User.posts.unshift(req.body);
  await User.save();

  const recipients = await UserModel.find({
    "people.approved._id": User._id,
    "people.approved.subscribed": true,
  });
  const payload = JSON.stringify({
    title: "Paradigm Broadcast",
    body: `New Broadcast from ${User.username}`,
  });
  recipients.forEach((recipient) => {
    recipient.notifications.forEach((subscription) => {
      webpush
        .sendNotification(subscription, payload)
        .catch((err) => console.error(err));
    });
  });

  res.end();
});

router.put("/:uid/:post", async (req, res) => {
  const User = await UserModel.findOne({ _id: req.params.uid });
  const OldPost = await User.posts.id(req.params.post);

  await UserModel.findOneAndUpdate(
    { _id: req.params.uid, "posts._id": req.params.post },
    {
      $set: {
        "posts.$.content": req.body.content,
        "posts.$.file": req.body.file,
      },
    }
  );

  res.end();
});

router.get("/:uid/delete/:id", async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid });
  var Index = await User.posts.findIndex((post) => {
    return post._id == req.params.id;
  });
  User.posts[Index].remove();
  await User.save();
  res.end();
});

router.get("/:uid/like/:profile/:post", async (req, res) => {
  var User = await UserModel.findOneAndUpdate(
    { _id: req.params.uid, "people.approved._id": req.params.profile },
    { $push: { "people.approved.$.liked_posts": req.params.post } }
  );
  var Profile = await UserModel.findOneAndUpdate(
    { _id: req.params.profile, "posts._id": req.params.post },
    { $inc: { "posts.$.likes": 1 } }
  );
  res.json({
    user: await UserModel.findOne({ _id: req.params.uid }),
    profile: await UserModel.findOne({ _id: req.params.profile }),
  });
});

router.get("/:uid/unlike/:profile/:post", async (req, res) => {
  var User = await UserModel.findOne({ _id: req.params.uid });
  var u_index = await User.people.approved.findIndex((person) => {
    return person._id == req.params.profile;
  });
  var post_index = await User.people.approved[u_index].liked_posts.findIndex(
    (post) => {
      return post._id == req.params.post;
    }
  );
  await User.people.approved[u_index].liked_posts.splice(post_index, 1);
  await User.save();
  var Profile = await UserModel.findOneAndUpdate(
    { _id: req.params.profile, "posts._id": req.params.post },
    { $inc: { "posts.$.likes": -1 } }
  );
  res.json({
    user: await UserModel.findOne({ _id: req.params.uid }),
    profile: await UserModel.findOne({ _id: req.params.profile }),
  });
});

router.put("/:uid/subscribe/:profile", async (req, res) => {
  await UserModel.findOneAndUpdate(
    { _id: req.params.uid, "people.approved._id": req.params.profile },
    { $set: { "people.approved.$.subscribed": true } }
  );
  const user = await UserModel.findOne({ _id: req.params.uid });
  res.json(user);
});

router.put("/:uid/unsubscribe/:profile", async (req, res) => {
  await UserModel.findOneAndUpdate(
    { _id: req.params.uid, "people.approved._id": req.params.profile },
    { $set: { "people.approved.$.subscribed": false } }
  );
  const user = await UserModel.findOne({ _id: req.params.uid });
  res.json(user);
});

module.exports = router;
