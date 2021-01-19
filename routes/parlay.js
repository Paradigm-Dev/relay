const express = require("express");
const webpush = require("web-push");
const router = express.Router();

const UserModel = require("../models/User.js");
const ThreadModel = require("../models/Thread.js");

// GET ALL THREADS
router.get("/", async (req, res) => {
  const all = await ThreadModel.find({});

  all.forEach((thread) => {
    delete thread.replies;
  });

  res.json(all);
});

// GET SPECIFIC THREAD
router.get("/:id", async (req, res) => {
  res.json(await ThreadModel.findById(req.params.id));
});

// NEW THREAD
router.post("/", async (req, res) => {
  res.json(await ThreadModel.create(req.body));
});

// DELETE THREAD
router.delete("/:id", async (req, res) => {
  await ThreadModel.findByIdAndDelete(req.params.id);
  res.end();
});

// NEW REPLY
router.put("/:id", async (req, res) => {
  await ThreadModel.findByIdAndUpdate(req.params.id, {
    $push: {
      replies: {
        $each: [req.body],
        $position: 0,
      },
    },
  });
  res.end();
});

// DELETE REPLY
router.delete("/:thread/:reply", async (req, res) => {
  await ThreadModel.findByIdAndUpdate(req.params.thread, {
    $pull: { replies: { _id: req.params.reply } },
  });
  res.end();
});

// NEW SUBREPLY
router.put("/:id/:subid", async (req, res) => {
  const Thread = await ThreadModel.findById(req.params.id);
  const Reply = Thread.replies.id(req.params.subid);
  Reply.replies.unshift(req.body);
  await Thread.save();
  res.end();
});

// DELETE SUBREPLY
router.delete("/:thread/:reply/:subreply", async (req, res) => {
  const thread = await ThreadModel.findById(req.params.thread);
  const reply = thread.find((item) => item._id == req.params.reply);
  const subreply = reply.findIndex((item) => item._id == req.params.subreply);
  reply.replies.splice(subreply, 1);
  await thread.save();
  res.end();
});

module.exports = router;
