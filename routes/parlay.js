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

// NEW SUBREPLY
router.put("/:id/:subid", async (req, res) => {
  const Thread = await ThreadModel.findById(req.params.id);
  const Reply = Thread.replies.id(req.params.subid);
  Reply.replies.unshift(req.body);
  await Thread.save();
  res.end();
});

// router.put("/:uid/:post", async (req, res) => {
//   await UserModel.findOneAndUpdate(
//     { _id: req.params.uid, "posts._id": req.params.post },
//     {
//       $set: {
//         "posts.$.content": req.body.content,
//         "posts.$.file": req.body.file,
//       },
//     }
//   );

//   res.end();
// });

// router.get("/:uid/delete/:id", async (req, res) => {
//   var User = await UserModel.findOne({ _id: req.params.uid });
//   var Index = await User.posts.findIndex((post) => {
//     return post._id == req.params.id;
//   });
//   User.posts[Index].remove();
//   await User.save();
//   res.end();
// });

module.exports = router;
