const express = require("express");
const router = express.Router();

const UserModel = require("../models/User.js");

router.post("/:uid", async (req, res) => {
  await UserModel.findByIdAndUpdate(req.params.uid, {
    $set: { asteroid: req.body },
  });
  res.end();
});

router.get("/:uid", async (req, res) => {
  res.json(await UserModel.findById(req.params.uid));
});

module.exports = router;
