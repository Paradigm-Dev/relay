const express = require("express");
const fs = require("fs");
const router = express.Router();

const SupporterModel = require("../models/Supporter.js");

// OTHER
router.get("/terminal", (req, res) => {
  fs.readFile(`../files/terminal.html`, (error, data) => {
    res.write(data);
  });
});
router.get("/terms", (req, res) => {
  fs.readFile(`../files/terms.html`, (error, data) => {
    res.write(data);
  });
});
router.get("/crater.css", (req, res) => {
  fs.readFile(__dirname + "/../files/crater.css", (error, data) => {
    if (error) console.error(error);
    res.send(data);
  });
});
router.post("/campaign", async (req, res) => {
  await SupporterModel.create({
    f_name: req.body.f_name,
    l_name: req.body.l_name,
    email: req.body.email,
    phone: req.body.phone,
    notify: req.body.notify,
  });
  res.end();
});
router.get("/campaign/count", async (req, res) => {
  var Supporters = await SupporterModel.find({});
  res.json({ count: Supporters.length });
});

module.exports = router;
