const express = require("express");
const webpush = require("web-push");
const moment = require("moment");
const router = express.Router();

const UserModel = require("../models/User.js");

router.get("/:uid", async (req, res) => {
  const User = await UserModel.findById(req.params.uid);
  let all_posts = [];

  for (friend of User.people.approved) {
    const data = await UserModel.findById(friend._id);
    const posts = JSON.parse(JSON.stringify(data.posts));
    posts.forEach((post) => {
      post.uid = data._id;
      post.color = data.color;
      post.username = data.username;
      all_posts.push(post);
    });
  }

  res.json(all_posts.sort((a, b) => b.timestamp - a.timestamp));
});

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

  console.log(
    "\x1b[32m",
    "[ BRDCST ]",
    "\x1b[31m",
    moment().format("MM/DD/YYYY, HH:MM:SS"),
    "\x1b[33m",
    req.connection.remoteAddress,
    "\x1b[34m",
    User.username,
    "\x1b[0m",
    "made a new broadcast post"
  );

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

  console.log(
    "\x1b[32m",
    "[ BRDCST ]",
    "\x1b[31m",
    moment().format("MM/DD/YYYY, HH:MM:SS"),
    "\x1b[33m",
    req.connection.remoteAddress,
    "\x1b[34m",
    User.username,
    "\x1b[0m",
    "updated a broadcast post"
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

  console.log(
    "\x1b[32m",
    "[ BRDCST ]",
    "\x1b[31m",
    moment().format("MM/DD/YYYY, HH:MM:SS"),
    "\x1b[33m",
    req.connection.remoteAddress,
    "\x1b[34m",
    User.username,
    "\x1b[0m",
    "deleted a broadcast post"
  );

  res.end();
});

router.get("/:uid/like/:profile/:post", async (req, res) => {
  await UserModel.findOneAndUpdate(
    { _id: req.params.uid, "people.approved._id": req.params.profile },
    { $push: { "people.approved.$.liked_posts": req.params.post } }
  );
  await UserModel.findOneAndUpdate(
    { _id: req.params.profile, "posts._id": req.params.post },
    { $inc: { "posts.$.likes": 1 } }
  );

  const User = await UserModel.findById(req.params.uid);
  let all_posts = [];

  for (friend of User.people.approved) {
    const data = await UserModel.findById(friend._id);
    const posts = JSON.parse(JSON.stringify(data.posts));
    posts.forEach((post) => {
      post.uid = data._id;
      post.color = data.color;
      post.username = data.username;
      all_posts.push(post);
    });
  }

  res.json(all_posts.sort((a, b) => b.timestamp - a.timestamp));
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
  await UserModel.findOneAndUpdate(
    { _id: req.params.profile, "posts._id": req.params.post },
    { $inc: { "posts.$.likes": -1 } }
  );

  User = await UserModel.findById(req.params.uid);
  let all_posts = [];

  for (friend of User.people.approved) {
    const data = await UserModel.findById(friend._id);
    const posts = JSON.parse(JSON.stringify(data.posts));
    posts.forEach((post) => {
      post.uid = data._id;
      post.color = data.color;
      post.username = data.username;
      all_posts.push(post);
    });
  }

  res.json(all_posts.sort((a, b) => b.timestamp - a.timestamp));
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
